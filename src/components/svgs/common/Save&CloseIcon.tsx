import { cn } from "@/lib/utils";
import React from "react";

const SaveCloseIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn("size-5 stroke-dark-gray", className)}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.82422 10.3416L11.1742 7.99164"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.1742 10.3416L8.82422 7.99164"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.0176 1.66669H5.98424C4.20924 1.66669 2.76758 3.11669 2.76758 4.88335V16.625C2.76758 18.125 3.84258 18.7584 5.15924 18.0334L9.22591 15.775C9.65924 15.5334 10.3592 15.5334 10.7842 15.775L14.8509 18.0334C16.1676 18.7667 17.2426 18.1334 17.2426 16.625V4.88335C17.2342 3.11669 15.7926 1.66669 14.0176 1.66669Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SaveCloseIcon;
