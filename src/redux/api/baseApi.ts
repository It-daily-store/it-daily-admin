import { createApi } from "@reduxjs/toolkit/query/react";
import { tagTypesList } from "./tagTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: axiosBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_URL as string,
  }),
  // baseQuery: fetchBaseQuery({
  //     baseUrl: process.env.NEXT_PUBLIC_URL as string
  // }),
  tagTypes: tagTypesList,
  endpoints: () => ({}),
});
