import { ForbiddenError, RedisService, StatusCode } from "@Pick2Me/shared";
import { RequestHandler } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

export function verifyAccessToken(): RequestHandler {
  return async (req, res, next) => {
    try {
      const token = (req as any).cookies?.accessToken;

      if (!token) {
        res.status(StatusCode.Forbidden).json({
          success: false,
          message: "No token provided",
        });
        return;
      }

      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayload;

      const redisClient = RedisService.getInstance();

      const isUserBlacklisted = await redisClient.checkBlacklistedToken(decoded.id);

      console.log("isUserBlacklisted", isUserBlacklisted, "id", decoded.id);

      if (isUserBlacklisted) {
        res.clearCookie("refreshToken", { path: "/" });
        res.clearCookie("accessToken", { path: "/" });

        await redisClient.removeBlacklistedToken(decoded.id);

        throw ForbiddenError("Your account is blocked!");
      }

      const payload = {
        id: decoded.id,
        role: decoded.role,
      };

      const signed = jwt.sign(payload, process.env.GATEWAY_SHARED_SECRET!, {
        algorithm: "HS256",
        expiresIn: "30s",
        issuer: "api-gateway",
      });

      req.headers["x-gateway-jwt"] = signed;

      return next();
    } catch (err: unknown) {
      if (err instanceof TokenExpiredError) {
        console.log("token expired");

        res
          .status(StatusCode.Forbidden)
          .json({ message: "token expired", reason: "token_expired" });
        return;
      }
      console.log("invalid expired");

      res
        .status(StatusCode.Forbidden)
        .json({ message: "Invalid token", reason: "invalid_token" });
      return;
    }
  };
}
