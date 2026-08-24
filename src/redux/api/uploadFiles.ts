import { baseApi } from "./baseApi";
import { tagTypes } from "./tagTypes";
import type { AxiosProgressEvent } from "axios";

type TDeleteImages = {
  public_ids: string[];
  database_ids: string[];
};

export type TGetAllImagesArg = {
  folder: string | null;
  search?: string;
  page?: number;
  limit?: number;
};

export type TUploadImageArg = {
  formData: FormData;
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
};

const uploadFileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllImages: build.query({
      query: ({ folder, search, page, limit }: TGetAllImagesArg) => {
        return {
          url: "/upload/get-all",
          method: "GET",
          params: { folder, search, page, limit },
        };
      },
      providesTags: [tagTypes.upload],
    }),

    uploadImage: build.mutation({
      query: ({ formData, onUploadProgress }: TUploadImageArg) => {
        return {
          url: "/upload/upload-image",
          method: "POST",
          data: formData,
          onUploadProgress,
        };
      },
      invalidatesTags: [tagTypes.upload],
    }),

    deleteImages: build.mutation({
      query: (payload: TDeleteImages) => {
        return {
          url: "/upload/delete-images",
          method: "DELETE",
          data: payload,
        };
      },
      invalidatesTags: [tagTypes.upload],
    }),
  }),
});

export const {
  useUploadImageMutation,
  useGetAllImagesQuery,
  useDeleteImagesMutation,
} = uploadFileApi;
