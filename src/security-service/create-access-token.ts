import {
  AccessPayload,
  ForbiddenError,
  generateJwtToken,
  getRedisService,
  InternalError,
  StatusCode,
  UnauthorizedError,
  verifyToken,
} from "@Pick2Me/shared";
import { Request, Response } from "express";
import { NextFunction } from "http-proxy-middleware/dist/types";
import { TokenExpiredError } from "jsonwebtoken";

export const generateAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) throw ForbiddenError("refresh token is missing");

    const payload = verifyToken(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as AccessPayload;

    const redisSvc = getRedisService();
    const isUserBlacklisted = await redisSvc.checkBlacklistedToken(payload.id);
    const isTokenBlacklisted = await redisSvc.checkBlacklistedToken(
      refreshToken
    );

    if (isUserBlacklisted || isTokenBlacklisted)
      throw UnauthorizedError("Your account has been blocked!");

    const accessToken = generateJwtToken(
      { id: payload.id, role: payload.role },
      process.env.ACCESS_TOKEN_SECRET!,
      "3m"
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3 * 60 * 1000, //3 min
      path: "/",
    });

    res.status(StatusCode.OK).json({ success: true });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(StatusCode.Forbidden).json({ message: "token expired" });
      return;
    }
    throw InternalError("something went wrong");
  }
};
