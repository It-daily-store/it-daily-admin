import {
  BadgeCheck,
  CircleDashed,
  Clock,
  LucideIcon,
  Package,
  PackageCheck,
  RotateCcw,
  Truck,
  XCircle,
} from "lucide-react";

export type TOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type TOrderStatusConfig = {
  label: string;
  icon: LucideIcon;
  node: string;
  badge: string;
};

/**
 * Single place to edit order status copy and colour. The timeline line is built
 * from `label` — the backend no longer stores a sentence for it.
 */
export const orderStatusConfig: Record<TOrderStatus, TOrderStatusConfig> = {
  pending: {
    label: "Order placed",
    icon: Clock,
    node: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500/12 text-amber-700 dark:text-amber-400",
  },
  confirmed: {
    label: "Order confirmed",
    icon: BadgeCheck,
    node: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
    badge: "bg-blue-500/12 text-blue-700 dark:text-blue-400",
  },
  processing: {
    label: "Order being prepared",
    icon: Package,
    node: "bg-orange-500/12 text-orange-600 dark:text-orange-400",
    badge: "bg-orange-500/12 text-orange-700 dark:text-orange-400",
  },
  shipped: {
    label: "Order shipped",
    icon: Truck,
    node: "bg-indigo-500/12 text-indigo-600 dark:text-indigo-400",
    badge: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-400",
  },
  delivered: {
    label: "Order delivered",
    icon: PackageCheck,
    node: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  },
  cancelled: {
    label: "Order cancelled",
    icon: XCircle,
    node: "bg-destructive/12 text-destructive",
    badge: "bg-destructive/12 text-destructive",
  },
  returned: {
    label: "Order returned",
    icon: RotateCcw,
    node: "bg-slate-500/12 text-slate-600 dark:text-slate-400",
    badge: "bg-slate-500/12 text-slate-700 dark:text-slate-400",
  },
};

export const fallbackStatusConfig: TOrderStatusConfig = {
  label: "Order updated",
  icon: CircleDashed,
  node: "bg-muted text-foreground/70",
  badge: "bg-muted text-foreground/70",
};

export const getOrderStatusConfig = (status: string): TOrderStatusConfig =>
  orderStatusConfig[status as TOrderStatus] || fallbackStatusConfig;
