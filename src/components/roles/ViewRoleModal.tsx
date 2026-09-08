import { TRole } from "@/interface/auth.interface";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import PermissionMatrix from "./PermissionMatrix";
import {
  TPermissionCatalog,
  useGetPermissionCatalogQuery,
} from "@/redux/api/rolesApi";

type TProps = {
  viewData: TRole | null;
  setOpen: React.Dispatch<React.SetStateAction<null | TRole>>;
};

const ViewRoleModal = ({ viewData, setOpen }: TProps) => {
  const { data: catalogRes } = useGetPermissionCatalogQuery(undefined);
  const catalog: TPermissionCatalog = catalogRes?.data ?? [];

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
            <div className="pt-2">
              <PermissionMatrix
                catalog={catalog}
                value={viewData?.permissions ?? []}
                readOnly
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewRoleModal;
