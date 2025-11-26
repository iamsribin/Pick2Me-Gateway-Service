import express from "express";
import cors from "cors";
import { verifyToken } from "./middleware/verify-token";
import { morganMiddleware } from "./middleware/centralized-logging";
import helmet from "helmet";
import { buildProxy } from "./utils/build-proxy";
import { errorHandler } from "@Pick2Me/shared";
import cookieParser from 'cookie-parser';
import { generateAccessToken } from "./security-service/create-access-token";
import { logout } from "./security-service/blacklist-refresh-token";


const app = express();

// for client IP forward to headers
app.set("trust proxy", process.env.TRUST_PROXY === "true");

app.use(cookieParser());

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
    realtime: "http://localhost:5000/",
};

// Verify access token + blacklist user
app.use(verifyToken);

app.get("/api/v1/refresh",generateAccessToken)
app.post("/logout",logout)

// mount proxies
app.use("/api/v1/users", buildProxy(services.user));
app.use("/api/v1/drivers", buildProxy(services.driver));
app.use("/api/v1/payments", buildProxy(services.payment));
app.use("/api/v1/notifications", buildProxy(services.realtime));
app.use("/api/v1/bookings", buildProxy(services.booking));
app.use("/api/v1/vehicles", buildProxy(services.user,'/vehicles'));
app.use("/api/v1/admin/users", buildProxy(services.user,'/admin/users'));
app.use("/api/v1/admin/drivers", buildProxy(services.driver,"/admin/drivers"));
 
// Error handler
app.use(errorHandler);

export default app