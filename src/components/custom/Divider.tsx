import { cn } from "@/lib/utils";
import React from "react";

const Divider = ({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) => {
  return (
    <div className={cn("my-2 flex min-h-4 items-center", className)}>
      <div className="relative h-[1px] w-full bg-border-color">
        {text && (
          <p className="absolute -top-[.8rem] left-1/2 -translate-x-1/2">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Divider;
