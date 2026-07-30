import React, { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type TDeleteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  children?: ReactNode;
};

const DeleteModal = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  title = "Delete",
  confirmText = "Yes Delete",
  cancelText = "Cancel",
  children,
}: TDeleteModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-sm rounded-2xl p-6"
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-destructive/10">
            <div className="flex size-9 items-center justify-center rounded-full bg-destructive/15">
              <AlertCircle className="size-5 text-destructive" />
            </div>
          </div>

          <DialogTitle className="text-lg font-bold text-destructive">
            {title}
          </DialogTitle>

          {!children && (
            <p className="text-sm text-dark-gray">
              Are you sure you want to delete this? This action cannot be
              undone.
            </p>
          )}
        </div>

        {children && <div>{children}</div>}

        <div className="flex w-full gap-3 pt-2">
          <Button
            className="w-full rounded-full"
            variant={"outline"}
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
          <Button
            variant={"destructive"}
            loading={isLoading}
            onClick={onConfirm}
            className="w-full rounded-full"
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
