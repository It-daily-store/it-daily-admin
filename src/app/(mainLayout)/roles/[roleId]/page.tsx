"use client";

import PermissionGuard from "@/components/global/PermissionGuard";
import PermissionMatrix from "@/components/roles/PermissionMatrix";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import NoData from "@/components/shared/NoData";
import { updateRoleValidationSchema } from "@/components/utilities/validations/RoleValidation";
import { TModulePermission, TRole } from "@/interface/auth.interface";
import { useCan } from "@/lib/permissions";
import { globalError } from "@/lib/utils";
import {
  TPermissionCatalog,
  useGetPermissionCatalogQuery,
  useGetSingleRoleQuery,
  useUpdateRoleMutation,
} from "@/redux/api/rolesApi";
import { useAppSelector } from "@/redux/hooks";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

// setModule appends the edited module to the end of the array, so dirty state is compared on the set of granted keys instead of array order.
const grantedKeys = (permissions: TModulePermission[]) =>
  permissions.flatMap((module) =>
    Object.entries(module.permissions ?? {})
      .filter(([, granted]) => granted === true)
      .map(([key]) => `${module.module}:${key}`),
  );

const RoleDetailsPage = () => {
  const params = useParams();
  const roleId = params?.roleId as string;

  const {
    data: roleRes,
    isLoading,
    error,
  } = useGetSingleRoleQuery(roleId, { skip: !roleId });
  const { data: catalogRes } = useGetPermissionCatalogQuery(undefined);
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  const { user } = useAppSelector((s) => s.auth);
  const can = useCan();

  const role: TRole | undefined = roleRes?.data;
  const catalog: TPermissionCatalog = useMemo(
    () => catalogRes?.data ?? [],
    [catalogRes],
  );

  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<TModulePermission[]>([]);

  useEffect(() => {
    if (role) {
      setRoleName(role.role ?? "");
      setDescription(role.description ?? "");
      setPermissions(role.permissions ?? []);
    }
  }, [role]);

  if (!isLoading && error) {
    globalError(error);
  }

  const isOwnRole = Boolean(role?._id) && user?.role?._id === role?._id;
  const readOnly = isOwnRole || !can("can_update_role");

  const summary = useMemo(() => {
    const granted = new Set(grantedKeys(permissions));

    let total = 0;
    let grantedCount = 0;
    let untouched = 0;

    catalog.forEach((group) => {
      const count = group.permissions.filter((p) =>
        granted.has(`${group.module}:${p.key}`),
      ).length;
      total += group.permissions.length;
      grantedCount += count;
      if (count === 0) untouched += 1;
    });

    return { total, grantedCount, untouched, modules: catalog.length };
  }, [catalog, permissions]);

  const changeCount = useMemo(() => {
    if (!role) return 0;

    const loaded = new Set(grantedKeys(role.permissions ?? []));
    const current = new Set(grantedKeys(permissions));

    let diff = 0;
    loaded.forEach((key) => {
      if (!current.has(key)) diff += 1;
    });
    current.forEach((key) => {
      if (!loaded.has(key)) diff += 1;
    });

    if (roleName !== (role.role ?? "")) diff += 1;
    if (description !== (role.description ?? "")) diff += 1;

    return diff;
  }, [role, permissions, roleName, description]);

  const isDirty = changeCount > 0;

  const handleDiscard = () => {
    if (!role) return;
    setRoleName(role.role ?? "");
    setDescription(role.description ?? "");
    setPermissions(role.permissions ?? []);
  };

  const handleSave = async () => {
    if (!role?._id) return;

    const payload: Partial<TRole> = {
      role: roleName,
      description,
      permissions,
    };

    try {
      updateRoleValidationSchema.parse(payload);
    } catch (err) {
      if (err instanceof ZodError) {
        toast.error(err.issues[0]?.message);
      } else {
        toast.error("Update data validation failed");
      }
      return;
    }

    try {
      const res = await updateRole({ id: role._id, payload }).unwrap();
      toast.success(res.message);
    } catch (err) {
      globalError(err);
    }
  };

  return (
    <PermissionGuard permission="can_see_role_page">
      <div className="w-full pb-6">
        <Link
          href="/roles"
          className="inline-flex items-center gap-1.5 text-sm text-gray hover:text-primary"
        >
          <ArrowLeft size={14} />
          All roles
        </Link>

        {isLoading ? (
          <div className="flex flex-col gap-3 pt-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-12 w-full max-w-2xl" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        ) : !role ? (
          <div className="pt-6">
            <NoData text="This role could not be found" />
          </div>
        ) : (
          <>
            <div className="pt-5">
              {readOnly ? (
                <h1 className="text-xl font-semibold capitalize text-black lg:text-2xl">
                  {role.role}
                </h1>
              ) : (
                <Input
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Role name"
                  aria-label="Role name"
                  className="-mx-2 h-auto w-full max-w-2xl border border-transparent bg-transparent px-2 py-1 text-xl font-semibold capitalize text-black shadow-none hover:border-border-color focus-visible:border-border-color focus-visible:ring-0 md:text-xl lg:text-2xl"
                />
              )}

              <div className="max-w-2xl pt-2">
                {readOnly ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray">
                    {role.description || "No description"}
                  </p>
                ) : (
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description for this role"
                    aria-label="Role description"
                    className="-mx-2 min-h-0 w-[calc(100%+1rem)] resize-none border border-transparent bg-transparent px-2 py-1 text-sm leading-relaxed text-gray shadow-none hover:border-border-color focus-visible:border-border-color focus-visible:ring-0 md:text-sm"
                  />
                )}
              </div>

              <p className="pt-3 text-sm text-gray">
                {summary.modules} modules &middot; {summary.grantedCount} of{" "}
                {summary.total} granted &middot; {summary.untouched} untouched
              </p>

              {readOnly && (
                <p className="mt-4 inline-flex items-center gap-2 bg-accent px-3 py-2 text-sm text-gray">
                  <Lock size={14} className="shrink-0" />
                  {isOwnRole
                    ? "This is your own role, so it can't be edited here."
                    : "You don't have permission to edit roles, so this page is read-only."}
                </p>
              )}
            </div>

            <div className="pt-6">
              <PermissionMatrix
                catalog={catalog}
                value={permissions}
                onChange={readOnly ? undefined : setPermissions}
                readOnly={readOnly}
                inPage
                showExpandControls
              />
            </div>

            {!readOnly && isDirty && (
              <div className="sticky bottom-0 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border-color bg-background py-3">
                <p className="text-sm text-gray">
                  {changeCount} unsaved{" "}
                  {changeCount === 1 ? "change" : "changes"}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleDiscard}
                    disabled={isUpdating}
                  >
                    Discard
                  </Button>
                  <Button onClick={handleSave} loading={isUpdating}>
                    Save
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PermissionGuard>
  );
};

export default RoleDetailsPage;
