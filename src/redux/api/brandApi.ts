import { TBrand, TUpdateBrand } from "@/interface/brand.interface";
import { baseApi } from "./baseApi";
import { tagTypes } from "./tagTypes";

const brandApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllBrands: build.query({
      query: () => {
        return {
          url: "/brand/get-all",
          method: "GET",
        };
      },
      providesTags: [tagTypes.brands],
    }),

    createBrand: build.mutation({
      query: (payload: Pick<TBrand, "name" | "image">) => {
        return {
          url: "/brand/create",
          method: "POST",
          data: payload,
        };
      },
      invalidatesTags: [tagTypes.brands],
    }),

    deleteBrand: build.mutation({
      query: (id: string) => {
        return {
          url: `/brand/delete/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [tagTypes.brands],
    }),

    updateBrand: build.mutation({
      query: ({ id, payload }: { id: string; payload: TUpdateBrand }) => {
        return {
          url: `/brand/update/${id}`,
          method: "PATCH",
          data: payload,
        };
      },
      invalidatesTags: [tagTypes.brands],
    }),
  }),
});

export const {
  useGetAllBrandsQuery,
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useUpdateBrandMutation,
} = brandApi;
