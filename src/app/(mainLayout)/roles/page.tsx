"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { globalError } from "@/lib/utils";
import { TPermission, TRole } from "@/interface/auth.interface";
import { useDeleteRoleMutation, useGetRolesQuery } from "@/redux/api/rolesApi";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import TableSkeleton from "@/components/shared/TableSkeleton";
import ViewRoleModal from "@/components/roles/ViewRoleModal";
import { useAppSelector } from "@/redux/hooks";
import EditRoleModal from "@/components/roles/EditRoleModal";
import CreateRoleModal from "@/components/roles/CreateRoleModal";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import NoData from "@/components/shared/NoData";
import PageHeader from "@/components/common/PageHeader";

const Roles = () => {
  const { data: rolesData, isLoading, error } = useGetRolesQuery(undefined);
  const [veiwData, setViewData] = useState<TRole | null>(null);
  const [editData, setEditData] = useState<TRole | null>(null);
  const { permissions, user } = useAppSelector((s) => s.auth);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const rolePermission: TPermission | undefined = permissions?.find(
    (p) => p.feature === "role",
  );

  if (!isLoading && error) {
    globalError(error);
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteRole(id).unwrap();
      toast.success(res.message);
      setDeleteOpen(false);
    } catch (err) {
      globalError(err);
    }
  };

  return (
    <div className="w-full">
      <PageHeader
        title="User Roles"
        subtitle="Manage dynamic roles and permissions."
        buttons={
          <>
            <CreateRoleModal open={createOpen} setOpen={setCreateOpen} />
            <div></div>
          </>
        }
      />

      {!isLoading && error !== undefined && (
        <NoData text="Could not get roles" />
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : rolesData?.data ? (
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Serial</TableHead>
              <TableHead>Role Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rolesData?.data?.map((role: TRole, i: number) => (
              <TableRow key={role._id}>
                <TableCell className="w-48 font-medium">{i + 1}</TableCell>
                <TableCell className="w-80 font-semibold capitalize text-primary">
                  {role.role}
                </TableCell>
                <TableCell>
                  <div className="line-clamp-2 max-w-[400px] overflow-hidden text-ellipsis whitespace-normal">
                    {role.description}
                  </div>
                </TableCell>
                <TableCell className="flex h-full items-center gap-3">
                  <Button
                    onClick={() => setViewData(role)}
                    variant={"view_button"}
                    size={"base"}
                  ></Button>
                  {rolePermission?.access.update &&
                    user?.role._id !== role._id && (
                      <Button
                        onClick={() => setEditData(role)}
                        variant={"edit_button"}
                        size={"base"}
                      ></Button>
                    )}
                  {rolePermission?.access.delete &&
                    user?.role._id !== role._id && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant={"delete_button"}
                            size={"base"}
                          ></Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogTitle>Delete this role?</DialogTitle>
                          <h2 className="pb-4 text-red-orange">
                            Warning: You are about to the role ({role.role}
                            ).
                          </h2>
                          <h3 className="pb-2 text-sm">
                            #Deleting a role will permanently remove its
                            associated permissions and may impact all users
                            currently assigned to this role. Please ensure the
                            following:
                          </h3>
                          <ul className="list-decimal ps-5 text-sm text-gray">
                            <li>
                              Review which users are assigned to this role, as
                              they will lose access associated with this role.
                            </li>
                            <li>
                              Consider whether there is a suitable replacement
                              role to assign these users to
                            </li>
                            <li>
                              This action is irreversible and could disrupt
                              workflows and access for affected users.
                            </li>
                          </ul>

                          <div className="flex w-full gap-3 pt-4">
                            <DialogClose asChild>
                              <Button
                                onClick={() => setDeleteOpen(false)}
                                className="w-full"
                                variant={"outline"}
                              >
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button
                              loading={isDeleting}
                              variant={"destructive"}
                              className="w-full"
                              onClick={() => handleDelete(role._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <></>
      )}

      <ViewRoleModal viewData={veiwData} setOpen={setViewData} />
      <EditRoleModal editData={editData} setOpen={setEditData} />
    </div>
  );
};

export default Roles;
