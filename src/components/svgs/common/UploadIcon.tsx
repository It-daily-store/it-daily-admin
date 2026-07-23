import { cn } from "@/lib/utils";
import React from "react";

const UploadIcon = ({ className }: { className: string }) => {
  return (
    <svg
      className={cn(`size-5 stroke-dark-gray`, className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M7.49984 18.3333H12.4998C16.6665 18.3333 18.3332 16.6667 18.3332 12.5V7.49999C18.3332 3.33332 16.6665 1.66666 12.4998 1.66666H7.49984C3.33317 1.66666 1.6665 3.33332 1.6665 7.49999V12.5C1.6665 16.6667 3.33317 18.3333 7.49984 18.3333Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 7.92499L10 5.42499L12.5 7.92499"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 5.42499V12.0917"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 13.7583C8.24167 14.8417 11.7583 14.8417 15 13.7583"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UploadIcon;
