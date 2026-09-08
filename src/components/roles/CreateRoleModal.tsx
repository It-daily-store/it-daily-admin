import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { TModulePermission, TRole } from "@/interface/auth.interface";
import PermissionMatrix from "./PermissionMatrix";
import { createRoleValidationSchema } from "../utilities/validations/RoleValidation";
import { ZodError } from "zod";
import { toast } from "sonner";
import {
  TPermissionCatalog,
  useCreateRoleMutation,
  useGetPermissionCatalogQuery,
} from "@/redux/api/rolesApi";
import { globalError } from "@/lib/utils";
import { Plus } from "lucide-react";

type TProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const CreateRoleModal = ({ open, setOpen }: TProps) => {
  const [description, setDescription] = useState<string>("");
  const [roleName, setRoleName] = useState<string>("");
  const { data: catalogRes } = useGetPermissionCatalogQuery(undefined);
  const catalog: TPermissionCatalog = catalogRes?.data ?? [];
  const [permissions, setPermissions] = useState<TModulePermission[]>([]);
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();

  const handleCreateRole = async () => {
    const payload: Pick<TRole, "role" | "description" | "permissions"> = {
      role: roleName || "",
      description,
      permissions,
    };

    try {
      createRoleValidationSchema.parse(payload);
    } catch (err) {
      if (err instanceof ZodError) {
        console.log(err.issues[0]?.message);
        toast.error(err.issues[0]?.message);
      } else {
        toast.error("Update data validation failed");
        console.log(err);
      }

      return;
    }

    try {
      const res = await createRole(payload).unwrap();
      toast.success(res.message);
      setOpen(false);
      setRoleName("");
      setDescription("");
      setPermissions([]);
    } catch (err) {
      globalError(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="primary-btn">
        <Plus size={18} /> Create Role
      </DialogTrigger>
      <DialogContent className="w-[90vw] sm:max-w-[80vw] md:max-w-[70vw] xl:max-w-[60vw] 2xl:max-w-[50vw]">
        <DialogTitle>Create new Role</DialogTitle>

        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold text-black">Role</label>
          <Input
            placeholder="Enter Role Name"
            autoFocus={true}
            defaultValue={roleName}
            type="text"
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold text-black">
            Description
          </label>
          <Textarea
            placeholder="Write a short description of the role"
            className="min-h-32 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <h3 className="text-base font-semibold text-black">Permissions:</h3>
          <div className="pt-2">
            <PermissionMatrix
              catalog={catalog}
              value={permissions}
              onChange={setPermissions}
            />
          </div>
        </div>

        <div className="flex w-full gap-3 pt-4">
          <Button
            className="w-full"
            variant={"delete_solid"}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <AlertDialog>
            <AlertDialogTrigger className="w-full">
              <Button loading={isCreating} className="w-full">
                Create
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  <h2 className="pb-4 text-red-orange">
                    Warning: You are about to create a new role.
                  </h2>
                  <h3 className="pb-2 text-sm">
                    #Creating a new role will define a set of permissions that
                    can affect user access across the entire system. Please
                    consider the following:
                  </h3>
                  <ul className="list-decimal ps-5 text-sm text-gray">
                    <li>
                      Ensure the role name is appropriate and aligned with
                      organizational structure.
                    </li>
                    <li>
                      Review the permissions carefully to avoid giving
                      unintended access.
                    </li>
                    <li>
                      This new role can be assigned to multiple users, which
                      could impact their system capabilities.
                    </li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button onClick={handleCreateRole} loading={isCreating}>
                    Create
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoleModal;
