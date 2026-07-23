import { cn } from "@/lib/utils";
import React from "react";

const RemoveIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn("size-6 stroke-dark-gray", className)}
      viewBox="0 0 23 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.6628 6.39751C16.5637 6.0904 13.4461 5.93219 10.3377 5.93219C8.49502 5.93219 6.65234 6.02525 4.80966 6.21138L2.91113 6.39751"
        strokeWidth="2.07402"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.03027 5.45714L8.23502 4.23799C8.38392 3.35388 8.4956 2.69312 10.0684 2.69312H12.5067C14.0795 2.69312 14.2005 3.3911 14.3401 4.2473L14.5448 5.45714"
        strokeWidth="2.07402"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.661 9.33813L17.0561 18.7098C16.9537 20.1709 16.87 21.3063 14.2735 21.3063H8.29869C5.70218 21.3063 5.61843 20.1709 5.51605 18.7098L4.91113 9.33813"
        strokeWidth="2.07402"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.73242 16.1879H12.8315"
        strokeWidth="2.07402"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.95996 12.4649H13.6132"
        strokeWidth="2.07402"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default RemoveIcon;
