import {
  Bell,
  FolderTree,
  Image,
  Images,
  ListTree,
  LucideIcon,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Tag,
  UploadCloud,
  UserRound,
} from "lucide-react";
import {
  TNotification,
  TNotificationAction,
  TNotificationType,
} from "@/interface/notification.interface";

export type TNotificationConfig = {
  icon: LucideIcon;
  entityLabel: string;
  verbs?: Partial<Record<TNotificationAction, string>>;
  route?: (_noti: TNotification) => string | undefined;
};

export const defaultVerbs: Record<TNotificationAction, string> = {
  create: "created",
  update: "updated",
  delete: "deleted",
};

/**
 * Single place to edit notification copy, icons and destinations. Adding a
 * value to TNotificationType forces an entry here.
 */
export const notificationConfig: Record<
  TNotificationType,
  TNotificationConfig
> = {
  order: {
    icon: ShoppingBag,
    entityLabel: "order",
    verbs: { create: "placed" },
    route: (noti) => (noti.source ? `/orders/${noti.source}` : "/orders"),
  },
  product: {
    icon: Package,
    entityLabel: "product",
    // A deleted product has no detail page left to open.
    route: (noti) =>
      noti.actionType === "delete" || !noti.source
        ? "/products"
        : `/products/${noti.source}/edit`,
  },
  category: {
    icon: FolderTree,
    entityLabel: "category",
    route: () => "/categories",
  },
  productDetails: {
    icon: ListTree,
    entityLabel: "details category",
    route: () => "/detail-categories",
  },
  brand: {
    icon: Tag,
    entityLabel: "brand",
    route: () => "/brands",
  },
  productFilter: {
    icon: SlidersHorizontal,
    entityLabel: "product filter",
    route: () => "/products/filters",
  },
  bulkUpload: {
    icon: UploadCloud,
    entityLabel: "bulk upload",
    route: () => "/products/bulk-upload",
  },
  role: {
    icon: ShieldCheck,
    entityLabel: "role",
    route: () => "/roles",
  },
  user: {
    icon: UserRound,
    entityLabel: "user",
    route: () => "/users/admins",
  },
  gallery: {
    icon: Images,
    entityLabel: "gallery folder",
  },
  photo: {
    icon: Image,
    entityLabel: "photo",
  },
  address: {
    icon: MapPin,
    entityLabel: "address",
  },
};

export const fallbackIcon = Bell;

export const actionToneClasses: Record<TNotificationAction, string> = {
  create: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  update: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  delete: "bg-destructive/10 text-destructive",
};
