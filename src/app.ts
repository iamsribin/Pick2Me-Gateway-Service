import compression from "compression";
import cors from "cors";
import express, { Application } from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import http from "http";
import { limiter } from "./utils/rate-limiter";
import { isEnvDefined } from "./utils/env-checker";
import { logger, morganMiddleware } from "./middleware/centralized-logging";
import { registerRoutes } from "./routes";
import "dotenv/config";

class App {
  public app: Application;
  public server: http.Server;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.initialize();
  }

  private initialize(): void {
    isEnvDefined();
    this.applyMiddleware();
    this.setupRoutes();
  }

  private applyMiddleware(): void {
    const middlewares = [
      express.json({ limit: "50mb" }),
      cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
      }),
      compression(),
      helmet(),
      morganMiddleware,
      cookieParser(),
      limiter,
    ];

    middlewares.forEach((middleware) => this.app.use(middleware));
  }

  private setupRoutes(): void {
    registerRoutes(this.app);
  }

  public startServer(port: number): void {
    this.server.listen(port, () => {
      logger.info(`🚀 API Gateway is running on port ${port}`);
    });
  }
}

export default App;