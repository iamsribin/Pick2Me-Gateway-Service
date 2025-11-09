import { Request } from "express";
import { match } from "path-to-regexp";

const PUBLIC_ROUTE_PATTERNS: { method: string; path: string }[] = [
  // user public routes
  { method: "POST", path: "/api/v1/users/register" },
  { method: "POST", path: "/api/v1/users/check-registration" },
  { method: "POST", path: "/api/v1/users/resend-otp" },
  { method: "POST", path: "/api/v1/users/check-login-number" },
  { method: "POST", path: "/api/v1/users/check-login-email" },
    
  // public routes 
  { method: "GET", path: "/api/v1/vehicles/models" },
  { method: "GET", path: "/api/v1/refresh" },

  // driver public routes
  { method: "POST", path: "/api/v1/driver/register" },
  { method: "POST", path: "/api/v1/drivers/check-login-number" },
  { method: "POST", path: "/api/v1/driver/check-registration" },
  { method: "POST", path: "/api/v1/drivers/check-login-email" },
  
  { method: "POST", path: "/api/v1/drivers/vehicle/register" },
  { method: "POST", path: "/api/v1/drivers/location/register" },
  { method: "POST", path: "/api/v1/drivers/identification/register" },
  { method: "GET", path: "/api/v1/drivers/me/documents/resubmission/:id" },
  { method: "POST", path: "/api/v1/drivers/profile-image/register" },
  { method: "POST", path: "/api/v1/drivers/insurance/register" },
  { method: "POST", path: "/api/v1/drivers/me/document/resubmission" },
];
 
export const isPublic = (req: Request): boolean => {
  return PUBLIC_ROUTE_PATTERNS.some(r => {
    if (r.method !== req.method) return false;
    const matcher = match(r.path, { decode: decodeURIComponent });
    return Boolean(matcher(req.path));
  });
};