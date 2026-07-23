import { cn } from "@/lib/utils";
import React from "react";

const DialerIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-3", className)}
    >
      <path
        d="M6.0733 3.38664C6.6533 3.21331 7.2933 3.09998 7.99997 3.09998C11.1933 3.09998 13.78 5.68664 13.78 8.87998C13.78 12.0733 11.1933 14.66 7.99997 14.66C4.80664 14.66 2.21997 12.0733 2.21997 8.87998C2.21997 7.69331 2.57997 6.58664 3.1933 5.66664"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.24658 3.54665L7.17325 1.33331"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.24658 3.54669L7.49325 5.18669"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DialerIcon;
