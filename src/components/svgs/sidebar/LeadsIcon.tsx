import { cn } from "@/lib/utils";
import React from "react";

const LeadsIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-4 ", className)}
    >
      <path
        d="M11.3333 14H4.66659C1.99992 14 1.33325 13.3333 1.33325 10.6667V5.33333C1.33325 2.66667 1.99992 2 4.66659 2H11.3333C13.9999 2 14.6666 2.66667 14.6666 5.33333V10.6667C14.6666 13.3333 13.9999 14 11.3333 14Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33325 5.33331H12.6666"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 8H12.6667"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.3333 10.6667H12.6666"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.66663 7.52668C6.33305 7.52668 6.87329 6.98643 6.87329 6.32001C6.87329 5.65359 6.33305 5.11334 5.66663 5.11334C5.0002 5.11334 4.45996 5.65359 4.45996 6.32001C4.45996 6.98643 5.0002 7.52668 5.66663 7.52668Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.99992 10.8867C7.90659 9.92001 7.13992 9.16001 6.17325 9.07334C5.83992 9.04001 5.49992 9.04001 5.15992 9.07334C4.19325 9.16667 3.42659 9.92001 3.33325 10.8867"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LeadsIcon;
