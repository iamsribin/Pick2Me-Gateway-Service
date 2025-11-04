import express from "express";
import cors from "cors";
import { verifyToken } from "./middleware/verify-token";
import { logger, morganMiddleware } from "./middleware/centralized-logging";
import helmet from "helmet";
import { errorHandler } from "@retro-routes/shared";
import { buildProxy } from "./utils/build-proxy";

const app = express();

// for client IP forward to headers
app.set("trust proxy", process.env.TRUST_PROXY === "true");

//helmet for security headers
app.use(helmet())

// Centralized Logging
app.use(morganMiddleware);
 
// Cors origin policy
app.use(  
    cors({
        origin: `${process.env.CORS_ORIGIN}`,
        allowedHeaders: ["Authorization", "Content-Type", "x-user-role"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    })
);
 
// Services
const services = {
    user: "http://localhost:3001/",
    driver: "http://localhost:3002/",
    booking: "http://localhost:3003/",
    payment: "http://localhost:3004/",
    communication: "http://localhost:5000/",
};


// Verify access token + check blacklist user
app.use(verifyToken);

// mount proxies
app.use(["/api/user", "/api/admin"], buildProxy(services.user));
app.use("/api/driver", buildProxy(services.driver));
app.use("/api/booking", buildProxy(services.booking));
app.use("/api/payment", buildProxy(services.payment));
app.use("/api/communication", buildProxy(services.communication));
 
// Error handler
app.use(errorHandler);

export default app