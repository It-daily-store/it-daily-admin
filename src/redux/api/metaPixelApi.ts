import {
  TMetaPixelConfig,
  TMetaPixelLog,
  TTestConnectionResult,
} from "@/interface/metaPixel.interface";
import { baseApi } from "./baseApi";
import { tagTypes } from "./tagTypes";

const metaPixelApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMetaPixelConfig: build.query<{ data: TMetaPixelConfig }, undefined>({
      query: () => ({ url: "/meta-pixel/config", method: "GET" }),
      providesTags: [tagTypes.metaPixel],
    }),
    updateMetaPixelConfig: build.mutation<
      { data: TMetaPixelConfig; message: string },
      Record<string, unknown>
    >({
      query: (data) => ({ url: "/meta-pixel/config", method: "PUT", data }),
      invalidatesTags: (result) => (result ? [tagTypes.metaPixel] : []),
    }),
    testMetaPixelConnection: build.mutation<
      { data: TTestConnectionResult; message: string },
      void
    >({
      query: () => ({ url: "/meta-pixel/test-connection", method: "POST" }),
      invalidatesTags: (result) =>
        result ? [tagTypes.metaPixel, tagTypes.metaPixelLogs] : [],
    }),
    previewMetaPixelPayload: build.mutation<
      { data: Record<string, unknown> },
      { triggerKey?: string; statusRuleId?: string; sampleOrderId?: string }
    >({
      query: (data) => ({
        url: "/meta-pixel/preview-payload",
        method: "POST",
        data,
      }),
    }),
    getMetaPixelLogs: build.query<
      {
        data: TMetaPixelLog[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPage: number;
        };
      },
      Record<string, string | number | undefined>
    >({
      query: (params) => ({
        url: "/meta-pixel/logs",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.metaPixelLogs],
    }),
    retryMetaPixelEvent: build.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/meta-pixel/logs/${id}/retry`,
        method: "POST",
      }),
      invalidatesTags: (result) => (result ? [tagTypes.metaPixelLogs] : []),
    }),
  }),
});

export const {
  useGetMetaPixelConfigQuery,
  useUpdateMetaPixelConfigMutation,
  useTestMetaPixelConnectionMutation,
  usePreviewMetaPixelPayloadMutation,
  useGetMetaPixelLogsQuery,
  useRetryMetaPixelEventMutation,
} = metaPixelApi;
