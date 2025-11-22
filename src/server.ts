import dotenv from "dotenv";
import { isEnvDefined } from "./utils/env-checker"; 
dotenv.config();
import app from "./app";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { createRedisService, getRedisService } from "@Pick2Me/shared";

// server
const startServer = async () => {
    try {
        
        isEnvDefined();  

        // create redis service for check blacklist user and rate limiting
         createRedisService(process.env.REDIS_URL!);

        const redisSvc = getRedisService();
        const ioredisClient = redisSvc.raw();

        // rate limiting 
        app.use(rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 200, 
          standardHeaders: "draft-7",
          legacyHeaders: false,
          store: new RedisStore({
            sendCommand: (...args: any[]) => (ioredisClient as any).call(...args),
          }),
        }))

        //listen to port
        app.listen(process.env.PORT, () =>
            console.log(`User service running on port ${process.env.PORT}`)
        );
        
    } catch (err: any) {
        console.log(err.message);
    } 
};
 
startServer()