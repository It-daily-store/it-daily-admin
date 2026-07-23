import { baseApi } from "./baseApi";
import { tagTypes } from "./tagTypes";

const bulkUploadApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllUploadHistory: build.query({
      query: () => {
        return {
          url: "/upload-history/get-all",
          method: "GET",
        };
      },
      providesTags: [tagTypes.bulkUpload],
    }),
  }),
});

export const { useGetAllUploadHistoryQuery } = bulkUploadApi;
