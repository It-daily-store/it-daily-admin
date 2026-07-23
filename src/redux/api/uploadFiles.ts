import { baseApi } from "./baseApi";
import { tagTypes } from "./tagTypes";

type TDeleteImages = {
  public_ids: string[];
  database_ids: string[];
};

const uploadFileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllImages: build.query({
      query: (folder: string | null) => {
        return {
          url: `/upload/get-all?folder=${folder}`,
          method: "GET",
        };
      },
      providesTags: [tagTypes.upload],
    }),

    uploadImage: build.mutation({
      query: (formData: FormData) => {
        return {
          url: "/upload/upload-image",
          method: "POST",
          data: formData,
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
