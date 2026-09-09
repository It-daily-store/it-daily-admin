// Must mirror EAppModules in it-daily-backend roles.interface.ts — values are persisted on role documents
export enum EAppModules {
  gallery = "gallery",
  role = "role",
  product = "product",
  productDetails = "productDetails",
  category = "category",
  photo = "photo",
  user = "user",
  brand = "brand",
  bulkUpload = "bulkUpload",
  productFilter = "productFilter",
  deals = "deals",
  settings = "settings",
  orders = "orders",
  banner = "banner",
}

export type TPermissionKey =
  | "can_see_product_page"
  | "can_read_all_products"
  | "can_read_product_details"
  | "can_create_product"
  | "can_update_product"
  | "can_bulk_upload_products"
  | "can_download_product_template"
  | "can_see_order_page"
  | "can_read_all_orders"
  | "can_read_order_details"
  | "can_update_order_status"
  | "can_see_admin_page"
  | "can_see_customer_page"
  | "can_read_all_users"
  | "can_read_user_details"
  | "can_create_admin"
  | "can_delete_user"
  | "can_see_role_page"
  | "can_read_all_roles"
  | "can_create_role"
  | "can_update_role"
  | "can_delete_role"
  | "can_see_banner_page"
  | "can_read_all_banners"
  | "can_read_banner_details"
  | "can_create_banner"
  | "can_update_banner"
  | "can_rename_banner"
  | "can_publish_banner"
  | "can_duplicate_banner"
  | "can_delete_banner"
  | "can_see_deal_page"
  | "can_read_all_deals"
  | "can_read_deal_details"
  | "can_create_deal"
  | "can_update_deal"
  | "can_manage_deal_products"
  | "can_see_category_page"
  | "can_read_all_categories"
  | "can_read_category_details"
  | "can_create_category"
  | "can_update_category"
  | "can_delete_category"
  | "can_see_brand_page"
  | "can_read_all_brands"
  | "can_create_brand"
  | "can_update_brand"
  | "can_delete_brand"
  | "can_read_all_folders"
  | "can_create_folder"
  | "can_update_folder"
  | "can_delete_folder"
  | "can_read_all_photos"
  | "can_upload_photo"
  | "can_delete_photo"
  | "can_see_filter_page"
  | "can_read_all_filters"
  | "can_create_filter"
  | "can_update_filter"
  | "can_delete_filter"
  | "can_see_details_category_page"
  | "can_read_all_details_categories"
  | "can_create_details_category"
  | "can_update_details_category"
  | "can_delete_details_category"
  | "can_see_bulk_upload_page"
  | "can_read_bulk_upload_history"
  | "can_see_pc_builder_page"
  | "can_read_settings"
  | "can_update_settings"
  | "can_see_meta_pixel_page"
  | "can_read_marketing"
  | "can_update_marketing"
  | "can_read_meta_pixel_logs"
  | "can_retry_meta_pixel_event";

export type TModulePermission = {
  module: EAppModules;
  permissions: Record<string, boolean>;
};

export interface TRole {
  _id: string;
  role: string;
  description?: string;
  permissions: TModulePermission[];
  isDeleted: boolean;
}

export interface TUserName {
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface TAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface TUser {
  _id: string;
  address: TAddress;
  email: string;
  name: TUserName;
  password: string;
  isActive: boolean;
  role: TRole;
  isDeleted: boolean;
  isVerified: boolean;
  isMasterAdmin?: boolean;
  phoneNumber: string;
  profilePicture: string;
  fullName?: string;
  userType: "admin" | "customer";
}
