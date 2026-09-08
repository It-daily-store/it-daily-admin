import {
  Computer,
  DiamondPlusIcon,
  GalleryHorizontalEnd,
  GalleryVertical,
  HardDriveUpload,
  LayoutDashboard,
  LayoutGrid,
  ListTodo,
  LucideIcon,
  Package,
  ShoppingBasket,
  ShoppingCart,
  SlidersHorizontal,
  Tags,
  UserCog,
  UserPen,
  Users,
  UsersRound,
} from "lucide-react";
import { TPermissionKey } from "@/interface/auth.interface";

export type TSidebarItem = {
  title: string;
  link: string;
  icon: LucideIcon;
  permission?: TPermissionKey;
  children?: TSidebarItem[];
};

export type TSidebarGroup = {
  label: string;
  items: TSidebarItem[];
};

// A parent's `link` is a prefix for active state only — its trigger toggles rather than navigates.
export const sidebarGroups: TSidebarGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", link: "/", icon: LayoutGrid }],
  },
  {
    label: "Catalog",
    items: [
      {
        title: "Products",
        link: "/products",
        icon: ShoppingCart,
        permission: "can_see_product_page",
        children: [
          {
            title: "All Products",
            link: "/products",
            icon: GalleryVertical,
            permission: "can_see_product_page",
          },
          {
            title: "Create Product",
            link: "/products/create",
            icon: DiamondPlusIcon,
            permission: "can_create_product",
          },
          {
            title: "Bulk Upload",
            link: "/products/bulk-upload",
            icon: HardDriveUpload,
            permission: "can_see_bulk_upload_page",
          },
          {
            title: "Filters",
            link: "/products/filters",
            icon: SlidersHorizontal,
            permission: "can_see_filter_page",
          },
        ],
      },
      {
        title: "Categories",
        link: "/categories",
        icon: ListTodo,
        permission: "can_see_category_page",
      },
      {
        title: "Detail Categories",
        link: "/detail-categories",
        icon: LayoutDashboard,
        permission: "can_see_details_category_page",
      },
      {
        title: "Brands",
        link: "/brands",
        icon: Tags,
        permission: "can_see_brand_page",
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        title: "Orders",
        link: "/orders",
        icon: ShoppingBasket,
        permission: "can_see_order_page",
      },
      {
        title: "Deals",
        link: "/deals",
        icon: Package,
        permission: "can_see_deal_page",
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        title: "Users",
        link: "/users",
        icon: Users,
        permission: "can_see_admin_page",
        children: [
          {
            title: "Admins",
            link: "/users/admins",
            icon: UserPen,
            permission: "can_see_admin_page",
          },
          {
            title: "Customers",
            link: "/users/customers",
            icon: UsersRound,
            permission: "can_see_customer_page",
          },
        ],
      },
      {
        title: "Roles",
        link: "/roles",
        icon: UserCog,
        permission: "can_see_role_page",
      },
    ],
  },
  {
    label: "Storefront",
    items: [
      {
        title: "Banner Builder",
        link: "/storefront/banner-builder",
        icon: GalleryHorizontalEnd,
        permission: "can_see_banner_page",
      },
      {
        title: "PC Builder",
        link: "/storefront/pc-builder",
        icon: Computer,
        permission: "can_see_pc_builder_page",
      },
    ],
  },
];
