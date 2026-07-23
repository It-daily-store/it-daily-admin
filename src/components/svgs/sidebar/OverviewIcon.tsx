import { cn } from "@/lib/utils";
import React from "react";

const OverviewIcon = ({ className }: { className: string }) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-4 ", className)}
    >
      <path d="M4.58667 12.1V10.72" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 12.1V9.34003" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11.4133 12.1V7.95331" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M11.4133 3.90002L11.1067 4.26002C9.40667 6.24669 7.12667 7.65336 4.58667 8.28669"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.45996 3.90002H11.4133V5.84669"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.99992 14.6666H9.99992C13.3333 14.6666 14.6666 13.3333 14.6666 9.99998V5.99998C14.6666 2.66665 13.3333 1.33331 9.99992 1.33331H5.99992C2.66659 1.33331 1.33325 2.66665 1.33325 5.99998V9.99998C1.33325 13.3333 2.66659 14.6666 5.99992 14.6666Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default OverviewIcon;
