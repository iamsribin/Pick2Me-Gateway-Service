import { StatusCode } from "retro-roues-common";

export interface commonRes {
  status: StatusCode;
  message: string;
  id?: string;
  navigate?: string;
}

export interface IResponse<T> {
  status: StatusCode;
  message: string;
  navigate?: string | number;
  data?: T | null | [] | boolean;
}

export interface IWalletTransaction {
  id: string;
  date: Date;
  details: string;
  amount: number;
  status: string;
  userId: string;
}

export interface Message {
    message: string ;
  }

  export interface AuthResponse {
    message: string;
    name: string;
    refreshToken: string;
    token: string;
    _id: string;
  }

export interface IRideDetails {
  id: string;
  completedRides: number;
  cancelledRides: number;
}
export interface UserInterface {
  id: string;
  name: string;
  email: string;
  mobile: number;
  password: string;
  userImage?: string;
  referral_code?: string;
  joiningDate: Date;
  account_status: "Good" | "Block";
  reason?: string;
  isAdmin: boolean;
  wallet_balance: number;
  transactions: IWalletTransaction[];
  rideDetails: IRideDetails;
}

export interface PricingInterface{
  vehicleModel: string;
  image: string;
  minDistanceKm: string;
  basePrice: number;
  pricePerKm: number;
  eta: string;
  features: string[];
  updatedBy?: string;
  updatedAt?: Date;
}


export interface ResubmissionInterface {
  driverId: string;
  fields: (
    | "rc"
    | "model"
    | "registrationId"
    | "carImage"
    | "insurance"
    | "pollution"
    | "location"
    | "license"
    | "aadhar"
    | "driverImage"
  )[];
}