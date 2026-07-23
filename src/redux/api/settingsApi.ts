import { ISettings } from "@/interface/settings";
import { baseApi } from "./baseApi";

const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSettings: build.query<{ data: ISettings }, undefined>({
      query: () => ({
        url: "/settings",
        method: "GET",
      }),
    }),
    updateSettings: build.mutation<{ data: ISettings }, ISettings>({
      query: (data) => ({
        url: "/settings",
        method: "PUT",
        data,
      }),
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
