import { TResponse } from "@/interface/common.interface";
import { baseApi } from "./baseApi";
import { TNotification } from "@/interface/notification.interface";

const notificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<
      TResponse<{
        notifications: TNotification[];
        unreadCount: number;
      }>,
      {
        page: number;
        limit: number;
      }
    >({
      query: (params) => ({
        url: "/notification/my-notifications",
        method: "GET",
        params: params || {},
      }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetNotificationsQuery } = notificationApi;

export default notificationApi;
