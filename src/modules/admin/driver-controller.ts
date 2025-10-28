import { Request, Response } from "express";
import { generateSignedUrl } from "../../services/generateSignedUrl";
import { recursivelySignImageUrls } from "../../utils/recursive-image-URL-signing";
import { IResponse, StatusCode } from "@retro-routes/shared";
import { grpcClients } from "../../grpc/grpc-client-manager";

export default class DriverController {
  getDriversList = async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, search = "", status } = req.query;

      const searchTerm = search as string;

      await grpcClients.driverClient.GetDriversListByAccountStatus(
        { page, limit, search: searchTerm, status },
        async (
          err: Error | null,
          response: IResponse<null>
        ) => {
          if (err || Number(response.status) !== StatusCode.OK) {
            return res.status(+response?.status || 500).json({
              message: response?.message || "Something went wrong",
              data: response,
              navigate: response?.navigate || "",
            });
          }
          // if (response.data?.drivers) {
          //   const updatedDrivers = await Promise.all(
          //     response.data.drivers.map(async (val) => {
          //       const signedUrl = await generateSignedUrl(val.driverImage);
          //       return {
          //         ...val,
          //         driverImage: signedUrl,
          //       };
          //     })
          //   );

          //   response.data.drivers = updatedDrivers;
          // }

          res.status(+response.status).json(response.data);
        }
      );
    } catch (e: unknown) {
      console.log("error mess", e);
      res
        .status(StatusCode.InternalServerError)
        .json({ message: "Internal Server Error" });
    }
  };

  getDriverDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await grpcClients.driverClient.AdminGetDriverDetailsById(
        { id },
        async (
          err: Error | null,
          response: IResponse<null>
        ) => {
          console.log("response", response);
          if (err || Number(response.status) !== StatusCode.OK) {
            return res.status(+response?.status || 500).json({
              message: response?.message || "Something went wrong",
              data: response,
              navigate: response?.navigate || "",
            });
          }
          console.log("response.data",response.data);
          
          if (response.data) {
            await recursivelySignImageUrls(response.data);
          }

          res.status(+response.status).json(response.data);
        }
      );
    } catch (e: unknown) {
      console.log(e);
      res
        .status(StatusCode.InternalServerError)
        .json({ message: "Internal Server Error" });
    }
  };

  updateDriverAccountStatus = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { note, status, fields } = req.body;

      const request = { id, reason: note, status, fields };

      await grpcClients.driverClient.AdminUpdateDriverAccountStatus(
        request,
        (err: Error | null, response: IResponse<boolean>) => {
          if (err || Number(response.status) !== StatusCode.OK) {
            return res.status(+response?.status || 500).json({
              message: response?.message || "Something went wrong",
              data: response,
              navigate: response?.navigate || "",
            });
          }

          res.status(+response.status).json(response);
        }
      );
    } catch (e: unknown) {
      console.log(e);
      res
        .status(StatusCode.InternalServerError)
        .json({ message: "Internal Server Error" });
    }
  };
}
