import React, { ReactNode } from "react";
import {
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";

const GlobalTooltip = ({
  tooltip,
  children,
  side = "top",
  className,
}: {
  children: ReactNode | string;
  tooltip: ReactNode | string;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        className={cn("z-99999999999999 max-w-44", className)}
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
};

export default GlobalTooltip;
