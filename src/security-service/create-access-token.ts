import {
  AccessPayload,
  ForbiddenError,
  generateJwtToken,
  getRedisService,
  HttpError,
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
    const token = req.cookies.refreshToken;

    if (!token) throw ForbiddenError("refresh token is missing");

    const payload = verifyToken(
      token,
      process.env.REFRESH_TOKEN_SECRET! as string
    ) as AccessPayload;

    if (!payload) throw ForbiddenError("token missing");

    const redisSvc = getRedisService();
    const isBlacklisted = await redisSvc.checkBlacklistedToken(payload.id);

    if (isBlacklisted)
      throw UnauthorizedError("Your account has been blocked!");

    const accessToken = generateJwtToken(
      { id: payload.id, role: payload.role },
      process.env.ACCESS_TOKEN_SECRET! as string,
      "3m"
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3 * 60 * 1000, //3 min
      path: "/",
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    if (error instanceof TokenExpiredError) {
        console.log("token expired");
        res.status(StatusCode.Forbidden).json({ message: "token expired"});
        return
      }
    throw InternalError("something went wrong");
  }
};
