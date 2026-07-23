export interface TCrud {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export enum EAppFeatures {
  gallery = "gallery",
  role = "role",
  product = "product",
  productDetails = "productDetails",
  category = "category",
  photo = "photo",
  user = "user",
  brand = "brand",
  productFilter = "porductFilter",
}

export interface TPermission {
  feature: EAppFeatures;
  access: TCrud;
}

export interface TRole {
  _id: string;
  role: string;
  description?: string;
  permissions: TPermission[];
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
