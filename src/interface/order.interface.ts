import { TUser } from "./auth.interface";
export interface IAddress {
  address: string;
  city: string;
  district: string;
  user?: string;
}

// Interface for Order Item
export interface IOrderItem {
  productId: string;
  name: string;
  quantity: number;
  finalPrice: number;
  originalPrice: number;
  discountApplied: {
    type: "product" | "flashSale" | "deal";
    refId?: string;
    description?: string;
    discountValue: number;
  };
  image?: string;
  tax: number;
  shipping: number;
}

// Interface for Status History
export interface IStatusHistory {
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  timestamp: Date;
  notes?: string;
  updatedBy?: TUser;
}

// Interface for Payment Details
export interface IPaymentDetails {
  transactionId?: string;
  paymentDate?: Date;
}

// Main Order Interface
export interface IOrder {
  _id: string;
  user: TUser;
  userInfo: TUser;
  orderNumber: string;
  items: IOrderItem[];
  trackingNumber?: string;
  subtotal: number;
  couponDiscount: {
    refId: string;
    description: string;
    discountValue: number;
  };
  shippingAddress: IAddress;
  billingAddress: IAddress;
  totalAmount: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: "card" | "paypal" | "bank_transfer" | "cod";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentDetails: IPaymentDetails;
  statusHistory: IStatusHistory[];
  currentStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  shippingMethod: "standard" | "express" | "overnight";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AddOrderPayload = {
  products: {
    id: string;
    quantity: number;
    offer: {
      type: "deal" | "flashSale";
      refId: string;
    };
  }[];
  billingAddress: IAddress;
  shippingAddress: IAddress;
  paymentMethod: "card" | "paypal" | "bank_transfer" | "cod";
  shippingMethod: "standard" | "express" | "overnight";
  notes?: string;
  saveAddress?: boolean;
};
