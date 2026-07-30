"use client";
import TableSkeleton from "@/components/shared/TableSkeleton";
import { globalError } from "@/lib/utils";
import {
  useDeleteUserMutation,
  useGetAllAdminsQuery,
} from "@/redux/api/usersApi";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreateAdminModal from "@/components/users/admin/CreateAdminModal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import DeleteModal from "@/components/global/DeleteModal";
import { useAppSelector } from "@/redux/hooks";
import NoData from "@/components/shared/NoData";
import { User } from "lucide-react";
import { TUser } from "@/interface/auth.interface";
import PageHeader from "@/components/common/PageHeader";

const Admins = () => {
  const { data: adminData, isLoading, error } = useGetAllAdminsQuery("admin");
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const { user } = useAppSelector((s) => s.auth);

  const router = useRouter();

  if (!isLoading && error) {
    globalError(error);
  }

  const handleDeleteAdmin = async (id: string) => {
    try {
      const res = await deleteAdmin({ id, role: "admin" }).unwrap();
      toast.success(res.message);
      setDeleteOpen(null);
    } catch (err) {
      globalError(err);
    }
  };

  return (
    <div>
      <PageHeader
        title="👥 Admins"
        subtitle="Manage all administrators and their permissions."
        buttons={
          <CreateAdminModal
            open={createAdminOpen}
            setOpen={setCreateAdminOpen}
          />
        }
      />

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Serial</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Varified</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminData?.data?.map((admin: TUser, i: number) => (
              <TableRow key={admin?._id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  {admin?.name && (
                    <>
                      {`${admin?.name?.firstName} ${admin?.name?.lastName}`}{" "}
                      {user?._id === admin._id && `(me)`}
                    </>
                  )}
                </TableCell>
                <TableCell className="flex items-center gap-3">
                  {/* <Image src={admin?.profilePicture} alt={admin?.name?.firstName} width={30} height={30} className='size-8 rounded-full' /> */}
                  <Avatar>
                    <AvatarImage
                      className="size-10 object-cover"
                      src={admin?.profilePicture}
                    />
                    <AvatarFallback className="capitalize">
                      <div className="flex size-10 items-center justify-center rounded-full bg-background">
                        <User />
                      </div>
                    </AvatarFallback>
                  </Avatar>
                  {admin?.email}
                </TableCell>
                <TableCell className="font-semibold">
                  {!admin?.role?.isDeleted ? (
                    <p className="text-gray">{admin?.role?.role}</p>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger>
                        <p className="text-red">{admin?.role?.role}</p>
                      </TooltipTrigger>
                      <TooltipContent>
                        The role was probably deleted
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell className="font-semibold">
                  {admin?.isActive ? (
                    <p className="text-green-600">True</p>
                  ) : (
                    <p className="text-red">False</p>
                  )}
                </TableCell>
                <TableCell className="font-semibold">
                  {admin?.isVerified ? (
                    <p className="text-green-600">True</p>
                  ) : (
                    <p className="text-red">False</p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Button
                      variant={"view_button"}
                      size={"base"}
                      onClick={() => router.push(`/users/admins/${admin._id}`)}
                    ></Button>
                    <Button variant={"edit_button"} size={"base"}></Button>
                    {user?._id !== admin._id && (
                      <Button
                        onClick={() => setDeleteOpen(admin._id)}
                        variant={"delete_button"}
                        size={"base"}
                      ></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!isLoading && error !== undefined && (
        <NoData text="Admin data unavailable" />
      )}

      <DeleteModal
        open={deleteOpen !== null}
        onOpenChange={() => setDeleteOpen(null)}
        onConfirm={() => deleteOpen && handleDeleteAdmin(deleteOpen)}
        isLoading={isDeleting}
        title="Delete Admin"
      >
        <h2 className="pb-4 text-red-orange">
          Warning: You are about to delete an admin.
        </h2>
        <h3 className="pb-2 text-sm">
          #Deleting an admin can have significant consequences for system
          management and control. Please ensure the following before proceeding:
        </h3>
        <ul className="list-decimal ps-5 text-sm text-gray">
          <li>
            Verify that there are other admins with sufficient permissions to
            manage the system.
          </li>
          <li>
            This action will permanently remove the admin’s access and may
            affect critical administrative operations.
          </li>
        </ul>
      </DeleteModal>
    </div>
  );
};

export default Admins;
