import { cn } from "@/lib/utils";
import React from "react";

const LeadRankIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-4 ", className)}
    >
      <path
        d="M3.93341 11.3333H12.0601C13.3267 11.3333 13.9934 10.6667 13.9934 9.39998V1.33331H1.99341V9.39998C2.00007 10.6667 2.66674 11.3333 3.93341 11.3333Z"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.33325 1.33331H14.6666"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.33325 14.6666L7.99992 13.3333V11.3333"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6667 14.6666L8 13.3333"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 7.33331L7.1 5.57998C7.26666 5.43998 7.48666 5.47998 7.6 5.66665L8.4 6.99998C8.51334 7.18665 8.73334 7.21998 8.9 7.08665L11 5.33331"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LeadRankIcon;
