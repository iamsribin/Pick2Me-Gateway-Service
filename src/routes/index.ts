import { Application } from "express";
import { isValidated } from "../modules/auth/controller";

// Import all routes
import { protectedUserRoute, publicUserRoute } from "./user-route";
import { protectedDriverRoute, publicDriverRoute } from "./driver-route";
import authRoute from "./auth-route";
import adminRoute from "./admin-route";

interface RouteConfig {
  path: string;
  router: any;
  middleware?: any[];
}

export function registerRoutes(app: Application): void {
  // Public routes
  const publicRoutes: RouteConfig[] = [
    { path: "/api/user", router: publicUserRoute },
    { path: "/api/driver", router: publicDriverRoute },
    { path: "/api/auth", router: authRoute },
  ];

  // Protected routes
  const protectedRoutes: RouteConfig[] = [
    {
      path: "/api/user",
      router: protectedUserRoute,
      middleware: [isValidated("User")],
    },
    {
      path: "/api/driver",
      router: protectedDriverRoute,
      middleware: [isValidated("Driver")],
    },
    {
      path: "/api/admin",
      router: adminRoute,
      middleware: [isValidated("Admin")],
    },
  ];

  // Register public routes
  publicRoutes.forEach(({ path, router }) => {
    app.use(path, router);
  });

  // Register protected routes
  protectedRoutes.forEach(({ path, router, middleware = [] }) => {
    app.use(path, ...middleware, router);
  });
}