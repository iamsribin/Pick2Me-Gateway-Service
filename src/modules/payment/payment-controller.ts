import { Request, Response } from "express";
import { grpcClients } from "../../grpc/grpc-client-manager";
import { IResponse, StatusCode } from "@retro-routes/shared";

export default class PaymentController {
  
  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId, userId, driverId, amount } = req.body;

      // Validate input
      if (!bookingId || !userId || !driverId || !amount) {
        res
          .status(StatusCode.BadRequest)
          .json({ message: "Missing required fields" });
        return;
      }

      await grpcClients.paymentClient.CreateCheckoutSession({ bookingId, userId, driverId, amount },
        (err: Error | null, result: { sessionId: string; message: string }) => {
          
          if (err) res.status(StatusCode.BadRequest).json({ message: err.message });
          res.status(StatusCode.Created).json(result);
        }
      );
    } catch (error) {
      res.status(StatusCode.InternalServerError).json({ message: "Failed to create checkout session" });
    }
  }

  async processWalletPayment(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId, userId, driverId, amount } = req.body;

      // Validate input
      if (!bookingId || !userId || !driverId || !amount) {
        res
          .status(StatusCode.BadRequest)
          .json({ message: "Missing required fields" });
        return;
      }

      // Call payment service via gRPC
      await grpcClients.paymentClient.ProcessWalletPayment(
        { bookingId, userId, driverId, amount },
        (
          err: Error | null,
          result: { transactionId: string; message: string }
        ) => {
          if (err) {
            res.status(StatusCode.BadRequest).json({ message: err.message });
            return;
          }
          res.status(StatusCode.Created).json(result);
        }
      );
    } catch (error) {
      res
        .status(StatusCode.InternalServerError)
        .json({ message: "Failed to process wallet payment" });
    }
  }

  async conformCashPayment(req: Request, res: Response): Promise<void> {
    try {
      const {
        bookingId,
        userId,
        driverId,
        amount,
        idempotencyKey = 123,
      } = req.body;

      // Validate input
      if (!bookingId || !userId || !driverId || !amount) {
        res
          .status(StatusCode.BadRequest)
          .json({ message: "Missing required fields" });
        return;
      }

      // Call payment service via gRPC
      await grpcClients.paymentClient.ConformCashPayment(
        { bookingId, userId, driverId, amount, idempotencyKey },
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
      res
        .status(StatusCode.InternalServerError)
        .json({ message: "Failed to process cash payment" });
    }
  }

  async verifyDriverConformation(req: Request, res: Response): Promise<void> {
    try {
      const {
        bookingId,
        userId,
        driverId,
        amount,
        idempotencyKey = 123,
        conformation,
      } = req.body;

      // Validate input
      if (!bookingId || !userId || !driverId || !amount || !conformation) {
        res
          .status(StatusCode.BadRequest)
          .json({ message: "Missing required fields" });
        return;
      }

      await grpcClients.paymentClient.ConformCashPayment(
        { bookingId, userId, driverId, amount, idempotencyKey, conformation },
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
      res
        .status(StatusCode.InternalServerError)
        .json({ message: "Failed to process cash payment" });
    }
  }

  async getTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Call payment service via gRPC
      await grpcClients.paymentClient.GetTransaction(
        { transactionId: id },
        (err: Error | null, result: any) => {
          if (err) {
            res.status(StatusCode.BadRequest).json({ message: err.message });
            return;
          }
          res.status(StatusCode.OK).json(result);
        }
      );
    } catch (error) {
      res
        .status(StatusCode.InternalServerError)
        .json({ message: "Failed to fetch transaction" });
    }
  }

  async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;

      await grpcClients.paymentClient.HandleWebhook(
        { payload: JSON.stringify(payload) },
        (err: Error | null, result: { message: string }) => {
          if (err) {
            res.status(StatusCode.BadRequest).json({ message: err.message });
            return;
          }
          res.status(StatusCode.OK).json(result);
        }
      );
    } catch (error) {
      res
        .status(StatusCode.InternalServerError)
        .json({ message: "Failed to process webhook" });
    }
  }
}
