import { TUser } from "./auth.interface";
import { TBrand } from "./brand.interface";
import { TErrorSourse } from "./error.interface";
import { TProduct } from "./product.interface";

export type TWithError = {
  name: string;
  errorSources: TErrorSourse;
  data: TProduct;
};
export type TSuccessData = {
  name: string;
  slug: string;
  sku: string;
  brand: TBrand;
  mainCategory: string;
  createdAt: string;
  updatedAt: string;
  _id: string;
};

export type TBulkUploadHistory = {
  withError?: TWithError[];
  successData?: TSuccessData[];
  createdBy?: TUser;
  _id?: string;
  createdAt?: string;
  totalUploads?: number;
};
