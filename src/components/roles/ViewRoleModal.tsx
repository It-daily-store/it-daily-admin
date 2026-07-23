import { TPermission, TRole } from "@/interface/auth.interface";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { Switch } from "../ui/switch";

type TProps = {
  viewData: TRole | null;
  setOpen: React.Dispatch<React.SetStateAction<null | TRole>>;
};

const ViewRoleModal = ({ viewData, setOpen }: TProps) => {
  return (
    <div>
      <Dialog open={viewData !== null} onOpenChange={() => setOpen(null)}>
        <DialogContent className="w-[90vw] sm:max-w-[80vw] md:max-w-[70vw] xl:max-w-[60vw] 2xl:max-w-[50vw]">
          <DialogTitle>Role Details</DialogTitle>
          <DialogDescription className="text-base font-semibold capitalize">
            <h3>
              Role: <span className="text-primary">{viewData?.role}</span>
            </h3>
          </DialogDescription>

          <div>
            <h3 className="text-base font-semibold text-black">Description:</h3>
            <h4 className="mt-3 font-normal whitespace-pre-wrap rounded-md border border-border-color bg-background p-4 text-gray">
              {viewData?.description}
            </h4>
          </div>

          <div>
            <h3 className="text-base font-semibold text-black">Permissions:</h3>
            <div className="grid grid-cols-1 gap-2 pt-2 md:grid-cols-2 lg:grid-cols-3">
              {viewData?.permissions.map((permission: TPermission) => (
                <div
                  className="rounded-md bg-background p-3"
                  key={permission.feature}
                >
                  <h4 className="mb-3 border-b border-border-color pb-2 font-semibold capitalize">
                    {permission.feature}
                  </h4>
                  <div>
                    {Object.entries(permission.access).map(
                      (acc: [string, boolean]) => {
                        console.log(acc);
                        return (
                          <div
                            key={acc[0]}
                            className="flex items-center justify-between"
                          >
                            <span className="flex-1 text-gray">{acc[0]}</span>
                            <span className="flex-1">:</span>
                            <Switch checked={acc[1] === true} />
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewRoleModal;
