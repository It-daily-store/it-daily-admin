import { TProductCategory } from "@/interface/category";
import { baseApi } from "./baseApi";
import { tagTypes } from "./tagTypes";

const detailsCategoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDetailsCategories: build.query({
      query: () => {
        return {
          url: "/product-details-category/get-all",
          method: "GET",
        };
      },
      providesTags: [tagTypes.detailsCategory],
    }),
    createDetailsCategory: build.mutation({
      query: (payload: Pick<TProductCategory, "name" | "fields">) => {
        return {
          url: "/product-details-category/create",
          method: "POST",
          data: payload,
        };
      },
      invalidatesTags: (result) => (result ? [tagTypes.detailsCategory] : []),
    }),

    deleteDetailsCategory: build.mutation({
      query: (id) => {
        return {
          url: `/product-details-category/delete/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (result) => (result ? [tagTypes.detailsCategory] : []),
    }),

    updateDetailsCategory: build.mutation({
      query: ({
        id,
        payload,
      }: {
        id: string;
        payload: Pick<TProductCategory, "name" | "fields">;
      }) => {
        return {
          url: `/product-details-category/update/${id}`,
          method: "PATCH",
          data: payload,
        };
      },
      invalidatesTags: (result) => (result ? [tagTypes.detailsCategory] : []),
    }),
  }),
});

export const {
  useGetDetailsCategoriesQuery,
  useCreateDetailsCategoryMutation,
  useDeleteDetailsCategoryMutation,
  useUpdateDetailsCategoryMutation,
} = detailsCategoryApi;
