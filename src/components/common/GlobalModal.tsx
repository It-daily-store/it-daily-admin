"use client";
import React, { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import ResizeIcon from "../svgs/common/ResizeIcon";
import { XIcon } from "lucide-react";
import { createPortal } from "react-dom";

type TProps = {
  open: boolean;
  children?: ReactNode;
  triggerText?: string | ReactNode;
  title?: string | ReactNode;
  withTrigger?: boolean;
  resizable?: boolean;
  className?: string;
  customTitle?: string | ReactNode;
  buttons?: ReactNode;
  subTitle?: string;
  setOpen: (_: boolean) => void;
};

const GlobalModal = React.forwardRef<HTMLDivElement, TProps>(
  (
    {
      open,
      children,
      setOpen,
      title = "New Modal",
      className,
      subTitle,
      customTitle,
      resizable = true,
      buttons,
      ...rest
    },
    ref,
  ) => {
    const [isFullScreen, setIsFullScreen] = useState(false);

    return (
      <>
        {createPortal(
          open && (
            <div
              role="dialog"
              ref={ref}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <div
                className={cn(
                  "bg-background-foreground rounded-lg w-[800px] max-w-[90%] max-h-[90vh] relative flex flex-col",
                  className,
                  isFullScreen && "w-full h-full max-h-full max-w-full",
                )}
              >
                {/* Header */}
                {customTitle ? (
                  customTitle
                ) : (
                  <div className="flex items-center justify-between border-b border-forground-border px-5 py-3 pb-1 sticky top-0 rounded-tr-lg rounded-tl-lg bg-background-foreground">
                    <div>
                      <h3 className="text-black font-medium text-xl">
                        {title}
                      </h3>
                      {subTitle && (
                        <p className="text-xs text-gray font-light">
                          {subTitle}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {buttons}
                      {resizable && (
                        <Button
                          onClick={() => setIsFullScreen((prev) => !prev)}
                          variant={"secondary"}
                          size={"icon"}
                        >
                          <ResizeIcon />
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Body */}
                <div className="px-5 pb-4 flex-1 h-full  min-h-20 overflow-y-auto">
                  {children}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setOpen(false)}
                  className="absolute rounded-full cursor-pointer -right-3 bg-destructive size-6 flex items-center justify-center -top-3"
                >
                  <XIcon className="text-white text-sm" size={20} />
                </button>
              </div>
            </div>
          ),
          document.body,
        )}
      </>
    );
  },
);

GlobalModal.displayName = "Modal";

export default GlobalModal;
