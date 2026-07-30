import { TProduct } from "@/interface/product.interface";
import { baseApi } from "./baseApi";
import { tagTypes } from "./tagTypes";
import { TResponse } from "@/interface/common.interface";

const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    addNewProduct: build.mutation({
      query: (product: TProduct) => {
        const productClone = { ...product } as Partial<TProduct>; // Makes _id optional

        delete productClone._id;
        return {
          url: "/product/create-product",
          method: "POST",
          data: productClone,
        };
      },
      invalidatesTags: (result) => (result ? [tagTypes.product] : []),
    }),

    getAllProducts: build.query<
      TResponse<TProduct[]>,
      Record<string, string | number> | undefined
    >({
      query: (params) => {
        return {
          url: "/product/get-all",
          method: "GET",
          params: params || {},
        };
      },
      providesTags: (result) => (result ? [tagTypes.product] : []),
      keepUnusedDataFor: 180,
    }),

    getSingleProduct: build.query<TResponse<TProduct>, string>({
      query: (id) => ({
        url: `/product/single/${id}`,
        method: "GET",
      }),
    }),

    bulkUpload: build.mutation({
      query: (formData: FormData) => {
        return {
          url: "/product/bulk-upload",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.upload],
    }),

    updateProduct: build.mutation({
      query: ({ id, payload }: { id: string; payload: Partial<TProduct> }) => {
        return {
          url: `/product/update-product/${id}`,
          method: "PATCH",
          data: payload,
        };
      },
      invalidatesTags: (result) => (result ? [tagTypes.product] : []),
    }),

    downloadJsonTemplate: build.mutation({
      query: ({
        category,
        filters,
      }: {
        category?: string;
        filters: string[];
      }) => ({
        url: "/product/json-template",
        method: "GET",
        params: { category, filters },
      }),
    }),

    bulkJsonUpload: build.mutation({
      query: (formData: FormData) => {
        return {
          url: "/product/bulk-upload-json",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: [tagTypes.upload],
    }),
  }),
});

export const {
  useAddNewProductMutation,
  useGetAllProductsQuery,
  useBulkUploadMutation,
  useGetSingleProductQuery,
  useUpdateProductMutation,
  useDownloadJsonTemplateMutation,
  useBulkJsonUploadMutation,
} = productApi;
