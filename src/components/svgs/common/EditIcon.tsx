import { cn } from "@/lib/utils";
import React from "react";

const EditIcon = ({ className }: { className: string }) => {
  return (
    <svg
      className={cn(`size-5 stroke-dark-gray`, className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M11.05 2.99999L4.20829 10.2417C3.94996 10.5167 3.69996 11.0583 3.64996 11.4333L3.34162 14.1333C3.23329 15.1083 3.93329 15.775 4.89996 15.6083L7.58329 15.15C7.95829 15.0833 8.48329 14.8083 8.74162 14.525L15.5833 7.28332C16.7666 6.03332 17.3 4.60832 15.4583 2.86665C13.625 1.14165 12.2333 1.74999 11.05 2.99999Z"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9082 4.20834C10.2665 6.50834 12.1332 8.26668 14.4499 8.50001"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 18.3333H17.5"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default EditIcon;
