import { cn } from "@/lib/utils";
import React from "react";

const ResizeIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      width="24"
      height="26"
      viewBox="0 0 24 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-6 stroke-white", className)}
    >
      <path
        d="M9 23.4166H15C20 23.4166 22 21.3332 22 16.1249V9.87492C22 4.66658 20 2.58325 15 2.58325H9C4 2.58325 2 4.66658 2 9.87492V16.1249C2 21.3332 4 23.4166 9 23.4166Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.002 6.75L6.00195 19.25"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 10.9167V6.75H14"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.00195 15.0834V19.25H10.002"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.00195 6.75L18.002 19.25"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.00195 10.9167V6.75H10.002"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 15.0833V19.2499H14"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ResizeIcon;
