import { NextFunction, Request, Response } from "express";
import { isPublic } from "../utils/public-routes";
import { verifyAccessToken } from "@retro-routes/shared";

/**
 * Middleware to verify access token in request headers.
 * If the access token is valid, it calls next without any arguments.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express next function.
 */
export  const verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const status = isPublic(req);
        console.log(status? "It's a public route" : "It's a protected route");

        // If true, skip verify access token
        if (status) {
            return next();
        }

        console.log("role",req.headers["x-user-role"]);
        

        // Verify access token + check blacklist
        const verifyAccessTokenMiddleware = verifyAccessToken(
            process.env.JWT_SECRET as string
        );
        
        return verifyAccessTokenMiddleware(req, res, next);
    } catch (err: unknown) {
        next(err);
    }
};