import * as grpc from "@grpc/grpc-js";
import {
  userProto,
  driverProto,
  bookingProto,
  paymentProto,
} from "@retro-routes/shared";
import "dotenv/config";

class GrpcClientManager {
  private static instance: GrpcClientManager;
  public userClient: any;
  public driverClient: any;
  public bookingClient: any;
  public paymentClient: any;

  private constructor() {
    const domain =
      process.env.NODE_ENV === "dev"
        ? process.env.DEV_DOMAIN
        : process.env.PRO_DOMAIN;

    this.userClient = new (userProto as any).User(
      `${domain}:${process.env.USER_GRPC_PORT}`,
      grpc.credentials.createInsecure()
    );

    this.driverClient = new (driverProto as any).Driver(
      `${domain}:${process.env.DRIVER_GRPC_PORT}`,
      grpc.credentials.createInsecure()
    );

    this.bookingClient = new (bookingProto as any).Ride(
      `${domain}:${process.env.BOOKING_GRPC_PORT}`,
      grpc.credentials.createInsecure()
    );

    this.paymentClient = new (paymentProto as any).Payment(
      `${domain}:${process.env.PAYMENT_GRPC_PORT}`,
      grpc.credentials.createInsecure()
    );
  }

  public static getInstance(): GrpcClientManager {
    if (!GrpcClientManager.instance) {
      GrpcClientManager.instance = new GrpcClientManager();
    }
    return GrpcClientManager.instance;
  }
}

export const grpcClients = GrpcClientManager.getInstance();
