import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig, AxiosError, AxiosProgressEvent } from "axios";
import axiosInstance from "./axiosInstance";

export const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: "" },
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
      contentType?: string;
      onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
    },
    unknown,
    unknown
  > =>
  async ({
    url,
    method,
    data,
    params,
    headers,
    contentType,
    onUploadProgress,
  }) => {
    try {
      const result = await axiosInstance({
        url: baseUrl + url,
        method,
        data: method !== "GET" ? data : undefined,
        params,
        headers: {
          ...headers,
          ...(data instanceof FormData
            ? {}
            : {
                "Content-Type": contentType || "application/json",
              }),
        },
        onUploadProgress,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
