import { NextFunction, Request, Response } from "express";
import { isPublic } from "../utils/public-routes";
import { verifyAccessToken } from "@retro-routes/shared";


export  const verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const status = isPublic(req);
        console.log(status? "It's a public route" : "It's a protected route");

        if (status) {
            return next();
        }        

        // Verify access token + check blacklist
        const verifyAccessTokenMiddleware = verifyAccessToken(
            process.env.JWT_SECRET as string
        );
        
        return verifyAccessTokenMiddleware(req, res, next);
    } catch (err: unknown) {
        next(err);
    }
};