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
import { EAppFeatures } from "@/interface/auth.interface";

export type TSidebarItem = {
  title: string;
  link: string;
  icon: LucideIcon;
  feature?: EAppFeatures;
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
        feature: EAppFeatures.product,
        children: [
          {
            title: "All Products",
            link: "/products",
            icon: GalleryVertical,
            feature: EAppFeatures.product,
          },
          {
            title: "Create Product",
            link: "/products/create",
            icon: DiamondPlusIcon,
            feature: EAppFeatures.product,
          },
          {
            title: "Bulk Upload",
            link: "/products/bulk-upload",
            icon: HardDriveUpload,
            feature: EAppFeatures.bulkUpload,
          },
          {
            title: "Filters",
            link: "/products/filters",
            icon: SlidersHorizontal,
            feature: EAppFeatures.productFilter,
          },
        ],
      },
      {
        title: "Categories",
        link: "/categories",
        icon: ListTodo,
        feature: EAppFeatures.category,
      },
      {
        title: "Detail Categories",
        link: "/detail-categories",
        icon: LayoutDashboard,
        feature: EAppFeatures.productDetails,
      },
      {
        title: "Brands",
        link: "/brands",
        icon: Tags,
        feature: EAppFeatures.brand,
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
        feature: EAppFeatures.orders,
      },
      {
        title: "Deals",
        link: "/deals",
        icon: Package,
        feature: EAppFeatures.deals,
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
        feature: EAppFeatures.user,
        children: [
          {
            title: "Admins",
            link: "/users/admins",
            icon: UserPen,
            feature: EAppFeatures.user,
          },
          {
            title: "Customers",
            link: "/users/customers",
            icon: UsersRound,
            feature: EAppFeatures.user,
          },
        ],
      },
      {
        title: "Roles",
        link: "/roles",
        icon: UserCog,
        feature: EAppFeatures.role,
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
        feature: EAppFeatures.banner,
      },
      {
        title: "PC Builder",
        link: "/storefront/pc-builder",
        icon: Computer,
        feature: EAppFeatures.settings,
      },
    ],
  },
];
