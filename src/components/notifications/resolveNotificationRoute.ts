import { TNotification } from "@/interface/notification.interface";
import { notificationConfig } from "./notificationConfig";

export const resolveNotificationRoute = (
  noti: TNotification,
): string | undefined =>
  notificationConfig[noti.notificationType]?.route?.(noti);
