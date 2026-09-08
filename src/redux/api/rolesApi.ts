import { EAppModules, TRole } from "@/interface/auth.interface";
import { baseApi } from "./baseApi";
import { tagTypes } from "./tagTypes";

export type TPermissionCatalog = {
  module: EAppModules;
  label: string;
  permissions: { key: string; label: string }[];
}[];

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

    getSingleRole: build.query({
      query: (id: string) => {
        return {
          url: `/roles/${id}`,
          method: "GET",
        };
      },
      providesTags: [tagTypes.singleRole],
    }),

    getPermissionCatalog: build.query({
      query: () => {
        return {
          url: "/roles/permission-catalog",
          method: "GET",
        };
      },
      providesTags: [tagTypes.permissionCatalog],
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
      invalidatesTags: (result) =>
        result ? [tagTypes.roles, tagTypes.singleRole] : [],
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
  useGetSingleRoleQuery,
  useGetPermissionCatalogQuery,
  useUpdateRoleMutation,
  useCreateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;
