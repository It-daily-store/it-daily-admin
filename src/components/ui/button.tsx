import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { Eye, Loader, Pencil, Plus, Trash2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer text-gray justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
  {
    variants: {
      variant: {
        default:
          "bg-primary shadow hover:bg-primary/90 text-primary-foreground border border-primary hover:bg-primary/15 hover:text-black",
        primary_light:
          "bg-primary/10 shadow hover:bg-primary text-primary border border-primary hover:text-pure-white",
        secondary:
          "bg-secondary shadow text-secondary-foreground hover:bg-secondary/15 border border-secondary hover:text-black",
        secondary_light:
          "bg-secondary/10 shadow text-secondary hover:bg-secondary border border-secondary hover:text-pure-white",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        delete_solid: "text-md shadow bg-destructive text-pure-white",
        edit: "text-pure-white text-md shadow bg-vivid-orange",
        outline:
          "border border-input bg-background text-black shadow-xs hover:bg-accent hover:border-primary hover:text-primary",
        icon: "border-none p-0 m-0 text-xl",
        bordered: "border border-border-color p-0 m-0 text-base",
        plain: "border-none p-0 m-0 text-base",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        create_button:
          "border border-border-color rounded-lg size-9 text-lg p-0 hover:bg-primary/90 text-primary hover:text-pure-white hover:bg-primary bg-background",
        edit_button:
          "border border-secondary rounded-lg size-9 text-lg p-0 hover:bg-secondary/90 text-secondary hover:text-pure-white bg-background",
        delete_button:
          "border border-destructive size-9 rounded-lg text-lg hover:text-pure-white p-0 hover:bg-destructive/90 text-destructive bg-background",
        view_button:
          "border border-primary rounded-lg size-9 text-lg p-0 text-primary hover:text-pure-white hover:bg-primary bg-background",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-lg",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8",
        icon: "h-9 w-9 rounded-md",
        base: "p-0",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

export type TButtonVariants = VariantProps<typeof buttonVariants>;

type TExtraProps = {
  loading?: boolean;
  tooltip?: string;
};
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    TExtraProps,
    TButtonVariants {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      asChild = false,
      children,
      tooltip,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return tooltip ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
            disabled={loading || props.disabled}
          >
            {loading ? (
              <Loader className="animate-spin" size={18} />
            ) : variant === "delete_button" ? (
              <Trash2 size={18} />
            ) : variant === "edit_button" ? (
              <Pencil size={18} />
            ) : variant === "view_button" ? (
              <Eye size={18} />
            ) : variant === "create_button" ? (
              <Plus size={18} />
            ) : (
              children
            )}
          </Comp>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    ) : (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        disabled={loading || props.disabled}
      >
        {loading ? (
          <Loader className="animate-spin" size={18} />
        ) : variant === "delete_button" ? (
          <Trash2 size={18} />
        ) : variant === "edit_button" ? (
          <Pencil size={18} />
        ) : variant === "view_button" ? (
          <Eye size={18} />
        ) : variant === "create_button" ? (
          <Plus size={18} />
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
