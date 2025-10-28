import { Request, Response } from "express";
// import { grpcClients.userClient } from "./config/user.client";
import { uploadToS3Public } from "../../services/s3";
// import { UserProfileDto } from "./types";
import { Message } from "google-protobuf";
// import { AuthResponse } from "../../types/common/response";
import { grpcClients } from "../../grpc/grpc-client-manager";
import { IResponse, StatusCode } from "@retro-routes/shared";

class UserController {
  /**
   * Registers a new user with optional image upload and OTP verification
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userImage = req.file?.path || "";
      const token = req.cookies.otp;

      const userData = { ...req.body, userImage, token };
        grpcClients.userClient.Register(
        userData,
        (err: Error | null, result: Message) => {
          if (err) {
            const errorMessage = err.message.includes("UNKNOWN:")
              ? err.message.split("UNKNOWN: ")[1]
              : err.message;

            res.status(StatusCode.BadRequest).json({ message: errorMessage });
            return;
          }
          res.status(StatusCode.Created).json(result);
        }
      );
    } catch (error) {
      res.status(StatusCode.InternalServerError).json({
        message: "Failed to register user",
      });
    }
  }

  /**
   * Checks if user exists and initiates OTP flow if not registered
   */
  async checkUser(req: Request, res: Response): Promise<void> {
    try {
      console.log("=--=-");

      await grpcClients.userClient.CheckUser(
        req.body,
        (err: Error | null, result: { token: string; message: string }) => {
          if (err) {
            res.status(StatusCode.BadRequest).json({ message: err.message });
            return;
          }

          res.cookie("otp", result.token, {
            httpOnly: true,
            expires: new Date(Date.now() + 180000),
            sameSite: "none",
            secure: true,
          });
          res.status(StatusCode.Created).json(result);
        }
      );
    } catch (error) {
      res.status(StatusCode.InternalServerError).json({
        message: "Failed to check user",
      });
    }
  }

  /**
   * Authenticates user login credentials
   */
  async checkLoginUser(req: Request, res: Response): Promise<void> {
    try {
      console.log("checkLoginUser", req.body);

      await grpcClients.userClient.CheckLoginUser(
        req.body,
        (err: Error | null, result: IResponse<null>) => {
          if (err) {
            res.status(StatusCode.BadRequest).json({ message: err.message });
            return;
          }
          console.log("result==", result);
          res.status(StatusCode.Created).json(result);
        }
      );
    } catch (error) {
      res.status(StatusCode.InternalServerError).json({
        message: "Failed to authenticate user",
      });
    }
  }

  /**
   * Resends OTP for user verification
   */
  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      
      await grpcClients.userClient.ResendOtp(
        req.body,
        (err: Error | null, result: { token: string; message: string }) => {
          if (err) {
            res.status(StatusCode.BadRequest).json({ message: err.message });
            return;
          }

          res.cookie("otp", result.token, {
            httpOnly: true,
            expires: new Date(Date.now() + 180000),
            sameSite: "none",
            secure: true,
          });
          res.status(StatusCode.Created).json(result);
        }
      );
    } catch (error) {
      res.status(StatusCode.InternalServerError).json({
        message: "Failed to resend OTP",
      });
    }
  }

  /**
   * Handles Google login authentication
   */
  async checkGoogleLoginUser(req: Request, res: Response): Promise<void> {
    try {
      await grpcClients.userClient.CheckGoogleLoginUser(
        req.body,
        (err: Error | null, result: IResponse<null>) => {
          if (err) {
            res.status(StatusCode.BadRequest).json({ message: err.message });
            return;
          }
          res.status(StatusCode.Created).json(result);
        }
      );
    } catch (error) {
      res.status(StatusCode.InternalServerError).json({
        message: "Failed to authenticate Google login",
      });
    }
  }

  fetchUserProfile = async (req: Request, res: Response) => {
    try {
      const id = req.user?.id;

      await grpcClients.userClient.fetchUserProfile(
        { id },
        (err: Error | null, result: IResponse<null>) => {
          
          if (err) { 
            res.status(+result.status).json({ message: err.message });
            return; 
          }  
          res.status(+result.status).json(result.data);
        }
      );
    } catch (error) {
      console.log(error);
      res.status(StatusCode.InternalServerError).json({
        message: "Failed to fetch user profile",
      });
    }
  };

  uploadChatFile = async (req: Request, res: Response) => {
    try {
      const files: any = req.files;
      let Url = "";
      if (files) {
        [Url] = await Promise.all([uploadToS3Public(files["file"][0])]);
      }
      console.log("uploadChatFile url", Url);

      res
        .status(StatusCode.Accepted)
        .json({ message: "success", fileUrl: Url });
    } catch (error) {
      res
        .status(StatusCode.InternalServerError)
        .json({ message: "Internal Server Error" });
    }
  };
}

export const userController = new UserController();
 