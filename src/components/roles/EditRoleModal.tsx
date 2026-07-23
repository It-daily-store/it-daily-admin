import { TCrud, TPermission, TRole } from "@/interface/auth.interface";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
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
import { ZodError } from "zod";
import { toast } from "sonner";
import { useUpdateRoleMutation } from "@/redux/api/rolesApi";
import { globalError } from "@/lib/utils";
import { updateRoleValidationSchema } from "../utilities/validations/RoleValidation";

type TProps = {
  editData: TRole | null;
  setOpen: React.Dispatch<React.SetStateAction<null | TRole>>;
};

const EditRoleModal = ({ editData, setOpen }: TProps) => {
  const [description, setDescription] = useState<string | undefined>("");
  const [roleName, setRoleName] = useState<string | undefined>("");
  const [permissions, setPermissions] = useState<TPermission[] | []>([]);
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  useEffect(() => {
    if (editData) {
      setPermissions(editData.permissions);
      setRoleName(editData.role);
      setDescription(editData.description);
    }
  }, [editData]);

  const handleAccessChange = (feature: string, accessName: keyof TCrud) => {
    console.log(feature, accessName);

    if (permissions.length > 0) {
      setPermissions((prev) => {
        return prev.map((permission: TPermission) => {
          if (permission.feature === feature) {
            const updatedAccess = {
              ...permission.access,
              [accessName]: !permission.access[accessName],
            };

            return {
              ...permission,
              access: updatedAccess,
            };
          } else {
            return permission;
          }
        });
      });
    }
  };

  const handleUpdate = async () => {
    if (!editData?._id) {
      return;
    }

    const payload: Partial<TRole> = {
      role: roleName || "",
      description,
      permissions,
    };

    try {
      updateRoleValidationSchema.parse(payload);
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

    console.log(payload);

    try {
      const result = await updateRole({
        id: editData?._id,
        payload,
      }).unwrap();
      toast.success(result.message);
      setOpen(null);
    } catch (err) {
      globalError(err);
    }
  };

  console.log(roleName);

  return (
    <div>
      <Dialog open={editData !== null} onOpenChange={() => setOpen(null)}>
        <DialogContent className="w-[90vw] sm:max-w-[80vw] md:max-w-[70vw] xl:max-w-[60vw] 2xl:max-w-[50vw]">
          <DialogTitle>Edit Role</DialogTitle>
          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-black">Role</label>
            <Input
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
              className="min-h-40"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <h3 className="text-base font-semibold text-black">Permissions:</h3>
            <div className="grid grid-cols-1 gap-2 pt-2 md:grid-cols-2 lg:grid-cols-3">
              {permissions?.length > 0 &&
                permissions?.map((permission: TPermission) => (
                  <div
                    className="rounded-md bg-background p-3"
                    key={permission.feature}
                  >
                    <h4 className="mb-3 border-b border-border-color pb-2 font-semibold capitalize">
                      {permission.feature}
                    </h4>
                    <div>
                      {Object.entries(permission.access as TCrud).map(
                        (entry) => {
                          const acc = entry as [keyof TCrud, boolean];
                          return (
                            <div
                              key={acc[0]}
                              className="flex items-center justify-between"
                            >
                              <span className="text-gray">{acc[0]}:</span>
                              <Switch
                                onCheckedChange={() =>
                                  handleAccessChange(permission.feature, acc[0])
                                }
                                checked={acc[1] === true}
                              />
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex w-full gap-3 pt-4">
            <Button
              className="w-full"
              variant={"delete_solid"}
              onClick={() => setOpen(null)}
            >
              Cancel
            </Button>
            <AlertDialog>
              <AlertDialogTrigger className="w-full">
                <Button loading={isUpdating} className="w-full">
                  Update
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    <h2 className="pb-4 text-red-orange">
                      Warning: You are about to update the role and permissions.
                    </h2>
                    <h3 className="pb-2 text-sm">
                      #Role updates can significantly impact user access and
                      capabilities across the system. Please verify the
                      following before proceeding:
                    </h3>
                    <ul className="list-decimal ps-5 text-sm text-gray">
                      <li>
                        Double-check the permissions and access levels you are
                        assigning.
                      </li>
                      <li>
                        This action may restrict or expand the user`&apos;`s
                        ability to perform critical operations.
                      </li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>
                    <Button onClick={handleUpdate} loading={isUpdating}>
                      Update
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditRoleModal;
