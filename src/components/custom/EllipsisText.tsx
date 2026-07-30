import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";

type TProps = {
  text: string;
  width?: number;
  className?: string;
};

const EllipsisText = ({ text, width = 200, className }: TProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <p
          style={{ width }}
          className={cn(
            `overflow-hidden text-ellipsis whitespace-nowrap text-gray`,
            className,
          )}
        >
          {text}
        </p>
      </TooltipTrigger>
      <TooltipContent>
        <p className={cn("w-48 text-pure-white")}>{text}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default EllipsisText;
