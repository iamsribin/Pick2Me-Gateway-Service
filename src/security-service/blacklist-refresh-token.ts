import { getRedisService, StatusCode, verifyToken } from "@Pick2Me/shared";
import { NextFunction, Request, Response } from "express";

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      verifyToken(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      );
      const redis = getRedisService();
      await redis.addBlacklistedToken(refreshToken,30);
    }
    res.clearCookie("refreshToken", { path: "/" });
    res.clearCookie("accessToken", { path: "/" });
    res.status(StatusCode.OK).json({ success: true });
  } catch (err) {
    next(err);
  }
}
