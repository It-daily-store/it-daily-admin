import { cn } from "@/lib/utils";
import React from "react";

const PlusCircle = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn("size-4 stroke-dark-gray", className)}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_618_95894)">
        <path
          d="M7.66667 14.3333C11.3486 14.3333 14.3333 11.3486 14.3333 7.66667C14.3333 3.98477 11.3486 1 7.66667 1C3.98477 1 1 3.98477 1 7.66667C1 11.3486 3.98477 14.3333 7.66667 14.3333Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.66406 5.11133V10.2224"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.10938 7.66602H10.2205"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_618_95894">
          <rect width="15.3333" height="15.3333" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default PlusCircle;
