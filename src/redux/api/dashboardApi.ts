import { baseApi } from "./baseApi";

const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboarAnalytics: build.query({
      query: (year?: string) => ({
        url: "/dashboard",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetDashboarAnalyticsQuery } = dashboardApi;
