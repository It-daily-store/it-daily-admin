import { cn } from "@/lib/utils";
import React from "react";

const SidebarCollapseIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-5 ", className)}
    >
      <path
        d="M14.2006 6.31517L10.5254 9.99938L14.2006 13.6836"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.31641 0.526367V19.4737"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect
        x="0.75"
        y="0.75"
        width="18.5"
        height="18.5"
        rx="5.25"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export default SidebarCollapseIcon;
