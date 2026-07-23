import { baseApi } from "./baseApi";
import { tagTypes } from "./tagTypes";

type TGalleryFolder = {
  name: string;
  parent_id?: string;
};

const GalleryFolderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFolders: build.query({
      query: (parent_id: string | null) => {
        return {
          url: `/gallery/get-folders?parent_id=${parent_id}`,
          method: "GET",
        };
      },
      providesTags: [tagTypes.galleryFolder],
    }),

    createFolder: build.mutation({
      query: (payload: TGalleryFolder) => {
        return {
          url: `/gallery/create-folder`,
          method: "POST",
          data: payload,
        };
      },
      invalidatesTags: [tagTypes.galleryFolder],
    }),

    updateFolder: build.mutation({
      query: ({ id, name }: { id: string; name: string }) => {
        return {
          url: `/gallery/update-folder/${id}`,
          method: "PATCH",
          data: { name },
        };
      },
      invalidatesTags: [tagTypes.galleryFolder],
    }),

    deleteFolder: build.mutation({
      query: (id: string) => {
        return {
          url: `/gallery/delete/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [tagTypes.galleryFolder],
    }),
  }),
});

export const {
  useCreateFolderMutation,
  useGetFoldersQuery,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
} = GalleryFolderApi;
