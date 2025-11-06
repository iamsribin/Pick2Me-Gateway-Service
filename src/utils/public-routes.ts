import { Request } from "express";

const PUBLIC_ROUTES: { method: string; path: string }[] = [
  // user public routes
  { method: "POST", path: "/api/user/register" },
  { method: "POST", path: "/api/user/checkUser" },
  { method: "POST", path: "/api/user/resendOtp" },
  { method: "POST", path: "/api/user/checkLoginUser" },
  { method: "POST", path: "/api/user/checkGoogleLoginUser" },
  // { method: "GET", path: "/api/user/refresh" },
  { method: "GET", path: "/api/user/vehicleModels" },
  { method: "DELETE", path: "/api/user/logout" },
  
    
  // public routes 
  { method: "GET", path: "/api/booking/vehicleModels" },
  { method: "GET", path: "/api/refresh" },

  // driver public routes
  { method: "GET", path: "/api/driver/resubmission/:id" },
  { method: "POST", path: "/api/driver/checkLoginDriver" },
  { method: "POST", path: "/api/driver/registerDriver" },
  { method: "POST", path: "/api/driver/checkGoogleLoginDriver" },
  { method: "POST", path: "/api/driver/location" },
  { method: "POST", path: "/api/driver/handle-online-change" },
  { method: "POST", path: "/api/driver/checkRegisterDriver" },
  { method: "DELETE", path: "/api/driver/logout" },

  { method: "POST", path: "/api/driver/identification" },
  { method: "POST", path: "/api/driver/uploadDriverImage" },
  { method: "POST", path: "/api/driver/vehicleDetails" },
  { method: "POST", path: "/api/driver/insuranceDetails" },
  { method: "POST", path: "/api/driver/resubmission" },
];
 
export const isPublic = (req: Request): boolean => {
    return PUBLIC_ROUTES.some(
        (request) => request.method === req.method && request.path === req.path
    );
};