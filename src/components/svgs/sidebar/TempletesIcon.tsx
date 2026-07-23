import { cn } from "@/lib/utils";
import React from "react";

const TempletesIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-4", className)}
    >
      <path
        d="M14 4.6672V11.3339C14 13.3339 13 14.6672 10.6667 14.6672H5.33333C3 14.6672 2 13.3339 2 11.3339V4.6672C2 2.6672 3 1.33386 5.33333 1.33386H10.6667C13 1.33386 14 2.6672 14 4.6672Z"
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.3332 1.33386V6.57385C10.3332 6.86719 9.98649 7.01385 9.77315 6.82052L8.22652 5.39388C8.09985 5.27388 7.89982 5.27388 7.77315 5.39388L6.22652 6.82052C6.01319 7.01385 5.6665 6.86719 5.6665 6.57385V1.33386H10.3332Z"
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.8335 9.33386H11.6668"
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 12H11.6667"
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default TempletesIcon;
