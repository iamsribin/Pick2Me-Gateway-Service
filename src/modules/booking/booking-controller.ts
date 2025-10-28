import { Request, Response } from "express";
import { grpcClients } from "../../grpc/grpc-client-manager";
import { IResponse, StatusCode } from "@retro-routes/shared";

export interface ControllerResponse {
  message: string;
  data?: any;
  status?: string;
}

class BookingController {
  async fetchVehicles(req: Request, res: Response) {
    try {
      await grpcClients.bookingClient.fetchVehicles(
        {},
        (err: Error | null, response: IResponse<null>) => {
          if (err || Number(response.status) !== StatusCode.OK) {
            return res.status(+response?.status || 500).json({
              message: response?.message || "Something went wrong",
              data: response,
              navigate: response?.navigate || "",
            });
          }

          res.status(+response.status).json(response.data);
        }
      );
    } catch (error) {
      console.log(error);
      res.status(StatusCode.InternalServerError).json({
        status: "Failed",
        message: "Failed to register user",
      });
    }
  }

  async bookCab(req: Request, res: Response) {
    try {
      const data = req.body;
      const id = req.user?.id;
      data.userId = id;
      grpcClients.bookingClient.bookCab(data, (err: Error | null, response: any) => {
        if (err || Number(response.status) !== StatusCode.Created) {
          return res.status(+response?.status || 500).json({
            message: response?.message || "Something went wrong",
            data: response,
            navigate: response?.navigate || "",
          });
        }
        res.status(+response.status).json(response);
      });
    } catch (error) {
      console.log("errorr", error);
      res.status(StatusCode.InternalServerError).json({
        status: "Failed",
        message: "Failed to register user",
      });
    }
  }

  async fetchDriverBookingList(req: Request, res: Response) {
    try {
      const id = req.user?.id;
      const {role} = req.params
console.log({id,role});

      grpcClients.bookingClient.fetchDriverBookingList( 
        { id, role },
        (err: Error | null, response: any) => {
          if (err || Number(response.status) !== StatusCode.OK) {
            return res.status(+response?.status || 500).json({
              message: response?.message || "Something went wrong",
              data: response,
              navigate: response?.navigate || "",
            });
          }
          res.status(+response.status).json(response.data || []);
        }
      );
    } catch (error) {
      console.log("fetchDriverBookingList error", error);

      res.status(StatusCode.InternalServerError).json({
        status: "Failed",
        data: "Failed to register user",
      });
    }
  }

  async fetchDriverBookingDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // const id = req.user?.id;
      console.log("reach get-driver-booking-details", id);

      grpcClients.bookingClient.fetchDriverBookingDetails(
        { id },
        (err: Error | null, response: any) => {
          console.log("response", response);

          if (err || Number(response.status) !== StatusCode.OK) {
            return res.status(+response?.status || 500).json({
              message: response?.message || "Something went wrong",
              data: response,
              navigate: response?.navigate || "",
            });
          }
          res.status(+response.status).json(response.data);
        }
      );
    } catch (error) {
      res.status(StatusCode.InternalServerError).json({
        status: "Failed",
        data: "Failed to register user",
      });
    }
  }

  async checkSecurityPin(req: Request, res: Response) {
    try {
      const { securityPin, bookingId } = req.body;
      const payload = {
        securityPin,
        bookingId,
      };
      console.log("checkSecurityPin", payload);

      grpcClients.bookingClient.checkSecurityPin(
        payload,
        (err: Error | null, response: any) => {
          console.log("response", response);

          if (err || Number(response.status) !== StatusCode.Accepted) {
            return res.status(+response?.status || 500).json({
              message: response?.message || "Something went wrong",
              data: response,
              navigate: response?.navigate || "",
            });
          }
          res.status(+response.status).json(response.message);
        }
      );
    } catch (error) {
      res.status(StatusCode.InternalServerError).json({
        status: "Failed",
        data: "Failed to register user",
      });
    }
  }

  async cancelRide(req: Request, res: Response) {
    try {
      const { userId, rideId } = req.body;
      const payload = {
        userId,
        rideId,
      };

      grpcClients.bookingClient.cancelRide(payload, (err: Error | null, response: any) => {
        console.log("response", response);

        if (err || Number(response.status) !== StatusCode.Accepted) {
          return res.status(+response?.status || 500).json({
            message: response?.message || "Something went wrong",
            data: response,
            navigate: response?.navigate || "",
          });
        }
        res.status(+response.status).json(response.message);
      });
    } catch (error) {
      res.status(StatusCode.InternalServerError).json({
        status: "Failed",
        data: "Failed to cancel ride",
      });
    }
  }

  async rideCompleted(req: Request, res: Response) {
    try {
      const { bookingId, userId } = req.body;
      const payload = {
        bookingId,
        userId,
      };
      grpcClients.bookingClient.completeRide(payload, (err: Error | null, response: any) => {
        console.log("completeRide response", response);

        if (err || Number(response.status) !== StatusCode.Accepted) {
          return res.status(+response?.status || 500).json({
            message: response?.message || "Something went wrong",
            data: response,
            navigate: response?.navigate || "",
          });
        }
        res.status(+response.status).json(response.message);
      });
    } catch (error) {
      res.status(StatusCode.InternalServerError).json({
        status: "Failed",
        data: "Failed to complete ride",
      });
    }
  }
}

export const bookingController = new BookingController();
