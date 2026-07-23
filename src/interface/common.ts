import { TNotification } from "./notification.interface";

export type TSocketResponse<T> = {
  data: T;
  actionType: TNotification["actionType"];
  sourceType: TNotification["notificationType"];
};
