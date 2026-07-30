import React, { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Plus } from "lucide-react";

type TProps = React.ComponentPropsWithRef<typeof Dialog> & {
  open: boolean;
  // setOpen: Dispatch<SetStateAction<boolean>>;
  children?: ReactNode;
  triggerText?: string | ReactNode;
  title?: string;
  withTrigger?: boolean;
  className?: string;
  titleClass?: string;
  showCloseButton?: true;
};

const Modal = React.forwardRef<HTMLDivElement, TProps>(
  (
    {
      open,
      // setOpen,
      children,
      triggerText = "Open",
      title = "New Modal",
      withTrigger = false,
      className,
      titleClass,
      showCloseButton = true,
      ...rest
    },
    ref,
  ) => {
    return (
      <Dialog modal open={open} {...rest}>
        {withTrigger && (
          <DialogTrigger
            className={`${
              typeof triggerText === "string" ? "primary-btn" : ""
            }`}
          >
            {typeof triggerText === "string" ? (
              <>
                <Plus size={18} />
                {triggerText}
              </>
            ) : (
              triggerText
            )}
          </DialogTrigger>
        )}
        <DialogContent className={className} showCloseButton={showCloseButton}>
          <DialogTitle className={titleClass}>{title}</DialogTitle>
          <DialogDescription></DialogDescription>
          {children}
        </DialogContent>
      </Dialog>
    );
  },
);

Modal.displayName = "Modal";

export default Modal;
