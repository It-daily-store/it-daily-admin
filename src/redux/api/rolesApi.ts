import { TRole } from "@/interface/auth.interface";
import { baseApi } from "./baseApi";
import { tagTypes } from "./tagTypes";

const rolesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRoles: build.query({
      query: () => {
        return {
          url: "/roles/get-all",
          method: "GET",
        };
      },
      providesTags: [tagTypes.roles],
    }),

    createRole: build.mutation({
      query: (payload: Pick<TRole, "description" | "role" | "permissions">) => {
        return {
          url: "/roles/create-role",
          method: "POST",
          data: payload,
        };
      },
      invalidatesTags: (result) => (result ? [tagTypes.roles] : []),
    }),

    updateRole: build.mutation({
      query: ({ id, payload }: { id: string; payload: Partial<TRole> }) => {
        return {
          url: `/roles/update-role/${id}`,
          method: "PATCH",
          data: payload,
        };
      },
      invalidatesTags: (result) => (result ? [tagTypes.roles] : []),
    }),

    deleteRole: build.mutation({
      query: (id: string) => {
        return {
          url: `/roles/delete-role/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (result) => (result ? [tagTypes.roles] : []),
    }),
  }),
});

export const {
  useGetRolesQuery,
  useUpdateRoleMutation,
  useCreateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;
