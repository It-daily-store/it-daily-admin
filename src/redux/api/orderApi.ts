import { TOrderFilter } from "@/app/(mainLayout)/orders/page";
import { baseApi } from "./baseApi";
import { tagTypes } from "./tagTypes";

const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllOrders: build.query({
      query: (params: TOrderFilter) => ({
        url: "/order/admin/get-all",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.orders],
    }),

    updateOrder: build.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/order/admin/update/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result) => (result ? [{ type: tagTypes.orders }] : []),
    }),

    getOrderById: build.query({
      query: (id: string) => ({
        url: `/order/single/${id}`,
        method: "GET",
      }),
      providesTags: (_arg) => [{ type: tagTypes.orders }],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useUpdateOrderMutation,
  useGetOrderByIdQuery,
} = orderApi;
