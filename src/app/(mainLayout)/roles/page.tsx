"use client";

import { globalError } from "@/lib/utils";
import { TModulePermission, TRole } from "@/interface/auth.interface";
import {
  useDeleteRoleMutation,
  useGetPermissionCatalogQuery,
  useGetRolesQuery,
} from "@/redux/api/rolesApi";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks";
import CreateRoleModal from "@/components/roles/CreateRoleModal";
import DeleteModal from "@/components/global/DeleteModal";
import { toast } from "sonner";
import NoData from "@/components/shared/NoData";
import PageHeader from "@/components/common/PageHeader";
import { useCan } from "@/lib/permissions";
import Link from "next/link";
import GlobalTable, {
  TCustomColumnDef,
} from "@/components/common/GlobalTable/GlobalTable";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LayoutGrid, List } from "lucide-react";

const VIEW_STORAGE_KEY = "roles_view";

type TRolesView = "table" | "card";

const readStoredView = (): TRolesView => {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === "card" ? "card" : "table";
  } catch {
    return "table";
  }
};

const countGranted = (permissions: TModulePermission[] = []) =>
  permissions.reduce(
    (acc, module) =>
      acc +
      Object.values(module.permissions ?? {}).filter((v) => v === true).length,
    0,
  );

const Roles = () => {
  const { data: rolesData, isLoading, error } = useGetRolesQuery(undefined);
  const { data: catalogRes } = useGetPermissionCatalogQuery(undefined);
  const { user } = useAppSelector((s) => s.auth);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();
  const [roleToDelete, setRoleToDelete] = useState<TRole | null>(null);
  const [view, setView] = useState<TRolesView>("table");

  const can = useCan();

  // localStorage is read after mount so server and first client render agree.
  useEffect(() => {
    setView(readStoredView());
  }, []);

  const changeView = (next: TRolesView) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // storage can be unavailable in private windows; the choice just won't persist
    }
  };

  const totalPermissions: number = useMemo(
    () =>
      (catalogRes?.data ?? []).reduce(
        (acc: number, group: { permissions: unknown[] }) =>
          acc + group.permissions.length,
        0,
      ),
    [catalogRes],
  );

  const roles: TRole[] = rolesData?.data ?? [];

  if (!isLoading && error) {
    globalError(error);
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteRole(id).unwrap();
      toast.success(res.message);
      setRoleToDelete(null);
    } catch (err) {
      globalError(err);
    }
  };

  const grantedLabel = (role: TRole) =>
    totalPermissions
      ? `${countGranted(role.permissions)} of ${totalPermissions}`
      : `${countGranted(role.permissions)}`;

  const canDelete = (role: TRole) =>
    can("can_delete_role") && user?.role?._id !== role._id;

  const defaultColumns: TCustomColumnDef<TRole>[] = [
    {
      accessorKey: "serial",
      header: "Serial",
      cell: ({ row }) => <p>{row.index + 1}</p>,
      id: "serial",
      maxSize: 60,
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "role",
      header: "Role Title",
      cell: ({ row }) => (
        <Link
          href={`/roles/${row.original._id}`}
          className="font-semibold capitalize text-primary hover:underline"
        >
          {row.original.role}
        </Link>
      ),
      id: "role",
      minSize: 160,
      maxSize: 240,
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <p className="line-clamp-2 whitespace-normal text-gray">
          {row.original.description || "—"}
        </p>
      ),
      id: "description",
      minSize: 240,
      visible: true,
      canHide: true,
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ row }) => (
        <p className="text-dark-gray">{grantedLabel(row.original)}</p>
      ),
      id: "permissions",
      minSize: 120,
      maxSize: 160,
      visible: true,
      canHide: true,
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Link href={`/roles/${row.original._id}`}>
            <Button variant={"view_button"} size={"base"}></Button>
          </Link>
          {canDelete(row.original) && (
            <Button
              onClick={() => setRoleToDelete(row.original)}
              variant={"delete_button"}
              size={"base"}
            ></Button>
          )}
        </div>
      ),
      id: "actions",
      minSize: 120,
      maxSize: 150,
      visible: true,
      canHide: false,
    },
  ];

  return (
    <div className="w-full">
      <PageHeader
        title="User Roles"
        subtitle="Manage dynamic roles and permissions."
        buttons={
          <>
            <div className="flex items-center gap-1">
              <Button
                variant={"bordered"}
                size={"icon"}
                aria-label="Table view"
                aria-pressed={view === "table"}
                onClick={() => changeView("table")}
                className={cn(
                  view === "table" && "border-primary text-primary",
                )}
              >
                <List size={16} />
              </Button>
              <Button
                variant={"bordered"}
                size={"icon"}
                aria-label="Card view"
                aria-pressed={view === "card"}
                onClick={() => changeView("card")}
                className={cn(view === "card" && "border-primary text-primary")}
              >
                <LayoutGrid size={16} />
              </Button>
            </div>
            <CreateRoleModal open={createOpen} setOpen={setCreateOpen} />
          </>
        }
      />

      {!isLoading && error !== undefined && (
        <NoData text="Could not get roles" />
      )}

      {view === "table" ? (
        <GlobalTable
          tableName="roles_table"
          defaultColumns={defaultColumns}
          data={roles}
          isLoading={isLoading}
          limit={20}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Link
              key={role._id}
              href={`/roles/${role._id}`}
              className="font-semibold capitalize cursor-pointer"
            >
              <div className="flex flex-col gap-2 border bg-background-foreground rounded-lg hover:border-primary/50 hover:shadow-lg border-border-color p-4">
                <div className="flex items-start justify-between gap-2">
                  {role.role}
                  {canDelete(role) && (
                    <Button
                      onClick={() => setRoleToDelete(role)}
                      variant={"delete_button"}
                      size={"base"}
                    ></Button>
                  )}
                </div>

                <p className="line-clamp-3 min-h-[3.5rem] text-sm text-gray">
                  {role.description || "No description"}
                </p>

                <p className="text-xs text-dark-gray">
                  {grantedLabel(role)} permissions granted
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <DeleteModal
        open={roleToDelete !== null}
        onOpenChange={() => setRoleToDelete(null)}
        onConfirm={() => roleToDelete && handleDelete(roleToDelete._id)}
        isLoading={isDeleting}
        title="Delete this role?"
      >
        <h2 className="pb-4 text-red-orange">
          Warning: You are about to delete the role ({roleToDelete?.role}).
        </h2>
        <h3 className="pb-2 text-sm">
          #Deleting a role will permanently remove its associated permissions
          and may impact all users currently assigned to this role. Please
          ensure the following:
        </h3>
        <ul className="list-decimal ps-5 text-sm text-gray">
          <li>
            Review which users are assigned to this role, as they will lose
            access associated with this role.
          </li>
          <li>
            Consider whether there is a suitable replacement role to assign
            these users to
          </li>
          <li>
            This action is irreversible and could disrupt workflows and access
            for affected users.
          </li>
        </ul>
      </DeleteModal>
    </div>
  );
};

export default Roles;
