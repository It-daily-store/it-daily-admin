import { baseApi } from "./baseApi";
import { tagTypes } from "./tagTypes";

export type TBannerTemplateSummary = {
  _id: string;
  name: string;
  slug: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
};

const bannerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllTemplates: build.query({
      query: () => {
        return {
          url: "/banner/get-all",
          method: "GET",
        };
      },
      providesTags: [tagTypes.banner],
    }),

    getTemplate: build.query({
      query: (id: string) => {
        return {
          url: `/banner/get/${id}`,
          method: "GET",
        };
      },
      // Scoped to this one template's id, not the shared `banner` list tag —
      // otherwise every list-wide invalidation (create/rename/duplicate/
      // delete of ANY template) would refetch this query too, handing
      // <BannerBuilder> a new `template` object identity mid-edit and
      // resetting its undo history/selection even though nothing about
      // this specific template changed.
      providesTags: (result, error, id) =>
        result ? [{ type: tagTypes.singleBanner, id }] : [],
    }),

    createTemplate: build.mutation({
      query: (payload: { name: string; breakpoints: unknown }) => {
        return {
          url: "/banner/create",
          method: "POST",
          data: payload,
        };
      },
      invalidatesTags: (result) => (result ? [tagTypes.banner] : []),
    }),

    updateTemplate: build.mutation({
      query: ({
        id,
        payload,
      }: {
        id: string;
        payload: { name?: string; description?: string; breakpoints?: unknown };
      }) => {
        return {
          url: `/banner/update/${id}`,
          method: "PATCH",
          data: payload,
        };
      },
      // Deliberately does NOT invalidate tagTypes.banner (the list tag): a
      // Save from the builder shouldn't force-refetch this same template
      // through getTemplate (see providesTags comment above) and reset the
      // editor's in-progress state. The list page's cached rows go stale
      // until the next list-tag invalidation (rename/duplicate/delete/
      // create) or navigation remount — an accepted tradeoff over losing
      // unsaved builder state.
      invalidatesTags: (result, error, arg) =>
        result ? [{ type: tagTypes.singleBanner, id: arg.id }] : [],
    }),

    renameTemplate: build.mutation({
      query: ({ id, name }: { id: string; name: string }) => {
        return {
          url: `/banner/rename/${id}`,
          method: "PATCH",
          data: { name },
        };
      },
      invalidatesTags: (result) => (result ? [tagTypes.banner] : []),
    }),

    setTemplateActive: build.mutation({
      query: ({ id, is_active }: { id: string; is_active: boolean }) => {
        return {
          url: `/banner/set-active/${id}`,
          method: "PATCH",
          data: { is_active },
        };
      },
      // Must be the list tag, not singleBanner: activation is exclusive, so
      // it flips is_active on the outgoing template too. Invalidating only
      // the target's id would leave the previously-active row still showing
      // as active in the table.
      invalidatesTags: (result) => (result ? [tagTypes.banner] : []),
    }),

    duplicateTemplate: build.mutation({
      query: (id: string) => {
        return {
          url: `/banner/duplicate/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: (result) => (result ? [tagTypes.banner] : []),
    }),

    deleteTemplate: build.mutation({
      query: (id: string) => {
        return {
          url: `/banner/delete/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (result) => (result ? [tagTypes.banner] : []),
    }),
  }),
});

export const {
  useGetAllTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useRenameTemplateMutation,
  useSetTemplateActiveMutation,
  useDuplicateTemplateMutation,
  useDeleteTemplateMutation,
} = bannerApi;
