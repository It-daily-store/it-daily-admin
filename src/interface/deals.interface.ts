import { TUser } from "./auth.interface";
import { TProduct } from "./product.interface";

export type TDeal = {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  products: {
    productId: TProduct;
    discount: TProduct["discount"];
    dealStock?: number;
  }[];
  createdBy: TUser;
  lastUpdatedBy: TUser;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TCreateDeal = {
  title: string;
  description?: string;
  image?: string;
  startTime: string;
  endTime: string;
};

export type TDealProduct = {
  productId: string;
  discount: TProduct["discount"];
  dealStock?: number;
  name: string;
  thumbnail: string;
};

export type TDealPayloadProduct = {
  productId: string;
  discount: TProduct["discount"];
  dealStock?: number;
};
