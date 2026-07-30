import { baseApi } from "./baseApi";
import { tagTypes } from "./tagTypes";
import { TUser } from "@/interface/auth.interface";

export type TCreateAdmin = {
  email: string;
  password: string;
  role: string;
  name: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
};

const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllAdmins: build.query({
      query: (userType?: TUser["userType"]) => {
        return {
          url: "/user/admin/get-all",
          method: "GET",
          params: {
            userType,
          },
        };
      },
      providesTags: [tagTypes.admins],
    }),

    createAdmin: build.mutation({
      query: (payload: TCreateAdmin) => {
        return {
          url: "/user/create-admin",
          method: "POST",
          data: payload,
        };
      },
      invalidatesTags: [tagTypes.admins],
    }),

    deleteUser: build.mutation({
      query: ({ id, role }: { id: string; role: "admin" | "customer" }) => {
        return {
          url: `/user/${id}`,
          method: "DELETE",
          data: { role },
        };
      },
      invalidatesTags: [tagTypes.admins],
    }),

    getSingleUser: build.query({
      query: ({
        id,
        userType,
      }: {
        id: string;
        userType: "admin" | "customer";
      }) => {
        return {
          url: `/user/${id}?userType=${userType}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useGetAllAdminsQuery,
  useCreateAdminMutation,
  useDeleteUserMutation,
  useGetSingleUserQuery,
} = usersApi;
