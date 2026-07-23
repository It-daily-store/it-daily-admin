import { TProduct } from "@/interface/product.interface";
import { baseApi } from "./baseApi";
import { TPagination } from "@/interface/common.interface";
import { tagTypes } from "./tagTypes";
import { TDealPayloadProduct } from "@/interface/deals.interface";

const dealsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllDeals: build.query({
      query: (params: { page?: number; limit?: number; search?: string }) => ({
        url: "/deal/get-all",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.deals],
    }),

    getProductsForDeal: build.query<
      { data: TProduct[]; pagination: TPagination },
      {
        id: string;
        params: { page?: number; limit?: number; search?: string };
      }
    >({
      query: ({ id, params }) => ({
        url: `/deal/get-products/${id}`,
        method: "GET",
        params,
      }),
      providesTags: (result, err, arg) =>
        result ? [{ type: tagTypes.singleDeal, id: arg.id }] : [],
    }),

    getSingleDeal: build.query({
      query: (id: string) => ({
        url: `/deal/get-by-id/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) =>
        result ? [{ type: tagTypes.singleDeal, id }] : [],
    }),

    addProductsToDeal: build.mutation({
      query: ({
        id,
        products,
      }: {
        id: string;
        products: TDealPayloadProduct[];
      }) => ({
        url: `/deal/add-products/${id}`,
        data: products,
        method: "PUT",
      }),
      invalidatesTags: (result, error, arg) =>
        result ? [{ type: tagTypes.singleDeal, id: arg.id }] : [],
    }),
  }),
});

export const {
  useGetAllDealsQuery,
  useGetProductsForDealQuery,
  useGetSingleDealQuery,
  useAddProductsToDealMutation,
} = dealsApi;
