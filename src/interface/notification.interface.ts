import { TUser } from "./auth.interface";

export type TNotification = {
  _id: string;
  userTo: TUser | string;
  userFrom: TUser;
  opened: boolean;
  notificationType:
    | "gallery"
    | "role"
    | "product"
    | "productDetails"
    | "category"
    | "photo"
    | "user"
    | "brand"
    | "bulkUpload"
    | "productFilter"
    | "order";
  text: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
  actionType: "update" | "create" | "delete";
};
