import { cn } from "@/lib/utils";
import React from "react";

const MyLeadsIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-4 ", className)}
    >
      <path
        d="M12 12.5733H11.4933C10.96 12.5733 10.4533 12.78 10.08 13.1533L8.93998 14.28C8.41998 14.7933 7.57334 14.7933 7.05334 14.28L5.91333 13.1533C5.54 12.78 5.02667 12.5733 4.5 12.5733H4C2.89333 12.5733 2 11.6867 2 10.5934V3.32001C2 2.22667 2.89333 1.34003 4 1.34003H12C13.1067 1.34003 14 2.22667 14 3.32001V10.5934C14 11.68 13.1067 12.5733 12 12.5733Z"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.99988 6.66665C8.85776 6.66665 9.55322 5.97118 9.55322 5.1133C9.55322 4.25542 8.85776 3.56 7.99988 3.56C7.142 3.56 6.44653 4.25542 6.44653 5.1133C6.44653 5.97118 7.142 6.66665 7.99988 6.66665Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6666 10.44C10.6666 9.23996 9.47325 8.26666 7.99992 8.26666C6.52659 8.26666 5.33325 9.23996 5.33325 10.44"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MyLeadsIcon;
