import { cn } from "@/lib/utils";
import React from "react";

const WorkflowIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-4", className)}
    >
      <path
        d="M7.99992 14.6666C11.6818 14.6666 14.6666 11.6819 14.6666 7.99998C14.6666 4.31808 11.6818 1.33331 7.99992 1.33331C4.31802 1.33331 1.33325 4.31808 1.33325 7.99998C1.33325 11.6819 4.31802 14.6666 7.99992 14.6666Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.34009 9.67334C5.46009 9.87334 5.60675 10.06 5.77342 10.2267C7.00008 11.4534 8.99341 11.4534 10.2267 10.2267C10.7267 9.72668 11.0134 9.09332 11.1068 8.44666"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.89331 7.55336C4.98664 6.90003 5.27332 6.27333 5.77332 5.77333C6.99998 4.54667 8.99331 4.54667 10.2266 5.77333C10.4 5.94667 10.54 6.13334 10.66 6.32668"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.21338 11.4533V9.67334H6.99337"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.7866 4.54669V6.32668H9.00659"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default WorkflowIcon;
