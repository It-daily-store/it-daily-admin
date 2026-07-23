import { TUser } from "./auth.interface";
import { TBrand } from "./brand.interface";
import { TCategory } from "./category";
import { TErrorSourse } from "./error.interface";

export interface TReview {
  rating: number;
  review: string;
}

export interface TProductCategory {
  main: boolean;
  id: string;
}

export type TProductWarrenty = {
  days: number;
  lifetime: boolean;
};

export interface TProductAttribute {
  name: string;
  fields: Record<string, string>;
}

export type TProductFilter = {
  filterId: string;
  filter: string;
  value: string;
};

export interface TMeta {
  title: string;
  description: string;
  image: string;
}

export type TShipping = {
  free: boolean;
  cost: number;
};

export type TProduct = {
  _id: string;
  name: string;
  price: number;
  discount?: {
    type: "flat" | "percent";
    value: number;
  };
  sku: string;
  brand: TBrand | string; //when creating string, from database TBrand
  model: string;
  warranty: TProductWarrenty;
  reviews?: TReview[];
  key_features: string;
  quantity: number;
  category: TProductCategory[];
  description: string;
  videos?: string[];
  gallery?: string[];
  thumbnail: string;
  slug: string;
  attributes?: TProductAttribute[];
  filters?: TProductFilter[];
  meta?: TMeta;
  tags?: string[];
  isFeatured?: boolean;
  mainCategory?: TCategory | null;
  sales?: number;
  createdBy?: TUser;
  createdAt?: string;
  updatedAt?: string;
  shipping: TShipping;
};

type TWithError = { name: string; errors: TErrorSourse };
type TSuccessData = { name: string; slug: string; sku: string; _id: string };

export type TBulkUploadResults = {
  withError: TWithError[];
  successData: TSuccessData[];
};
