import { baseApi } from "./baseApi";
import { tagTypes } from "./tagTypes";

export type TUpdateProductFilter = {
  title: string;
  filterId: string;
  options: {
    optionId?: string;
    value: string;
  }[];
};

export type TCreateProductFilter = {
  title: string;
  options: string[];
};

const filtersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllProductFilters: build.query({
      query: () => ({
        url: "/product-filters/get-all",
        method: "GET",
      }),
      providesTags: [tagTypes.productFilter],
    }),

    createProductFilter: build.mutation({
      query: (payload: Partial<TCreateProductFilter>) => ({
        url: "/product-filters/create",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [tagTypes.productFilter],
    }),

    deleteProductFilter: build.mutation({
      query: (id: string) => ({
        url: `/product-filters/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.productFilter],
    }),

    updateProductFilter: build.mutation({
      query: ({
        payload,
        id,
      }: {
        payload: Partial<TUpdateProductFilter>;
        id: string;
      }) => ({
        url: `/product-filters/update/${id}`,
        method: "PATCH",
        data: payload,
      }),
      invalidatesTags: [tagTypes.productFilter],
    }),
  }),
});

export const {
  useCreateProductFilterMutation,
  useUpdateProductFilterMutation,
  useGetAllProductFiltersQuery,
  useDeleteProductFilterMutation,
} = filtersApi;
