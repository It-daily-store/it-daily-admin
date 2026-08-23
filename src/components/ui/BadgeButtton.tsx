import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { Button, TButtonVariants } from "./button";
import { cn } from "@/lib/utils";

type TProps = {
  className?: string;
  tooptip?: string;
  count: number;
  icon?: ReactNode;
  text?: string;
  variant?: TButtonVariants["variant"];
};

const BadgeButtton = React.forwardRef<
  HTMLButtonElement,
  TProps & ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, tooptip, count, icon, text, variant, ...rest }, ref) => {
  return (
    <div className="relative">
      <Button
        ref={ref}
        {...rest}
        tooltip={tooptip}
        variant={variant || "edit"}
        className={cn(
          "rounded-full outline-none h-10 w-10 p-0 border border-border-color",
          className,
        )}
      >
        {icon}
        {text}
      </Button>

      <div className="absolute -top-2 text-pure-white flex items-center justify-center right-0 bg-primary rounded-xl w-4 h-4 text-xs">
        {count > 99 ? "99+" : count}
      </div>
    </div>
  );
});
BadgeButtton.displayName = "BadgeButtton";

export default BadgeButtton;
