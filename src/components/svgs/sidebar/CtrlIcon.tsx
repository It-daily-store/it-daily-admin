import { cn } from "@/lib/utils";
import React from "react";

const CtrlIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={(cn("size-3 stroke-dark-gray"), className)}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.33268 4.66675H4.66602V9.33341H9.33268V4.66675Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.91602 12.8333C3.87852 12.8333 4.66602 12.0458 4.66602 11.0833V9.33325H2.91602C1.95352 9.33325 1.16602 10.1208 1.16602 11.0833C1.16602 12.0458 1.95352 12.8333 2.91602 12.8333Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.91602 4.66675H4.66602V2.91675C4.66602 1.95425 3.87852 1.16675 2.91602 1.16675C1.95352 1.16675 1.16602 1.95425 1.16602 2.91675C1.16602 3.87925 1.95352 4.66675 2.91602 4.66675Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33398 4.66675H11.084C12.0465 4.66675 12.834 3.87925 12.834 2.91675C12.834 1.95425 12.0465 1.16675 11.084 1.16675C10.1215 1.16675 9.33398 1.95425 9.33398 2.91675V4.66675Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.084 12.8333C12.0465 12.8333 12.834 12.0458 12.834 11.0833C12.834 10.1208 12.0465 9.33325 11.084 9.33325H9.33398V11.0833C9.33398 12.0458 10.1215 12.8333 11.084 12.8333Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CtrlIcon;
