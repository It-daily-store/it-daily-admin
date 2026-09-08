"use client";

import React from "react";
import { TPermissionKey } from "@/interface/auth.interface";
import { useCan } from "@/lib/permissions";

type TProps = {
  permission: TPermissionKey;
  children: React.ReactNode;
  message?: string;
};

const PermissionGuard = ({ permission, children, message }: TProps) => {
  const can = useCan();

  if (!can(permission)) {
    return (
      <div className="rounded-md border border-border-color bg-background p-6 text-gray">
        <p>{message ?? "You don't have permission to view this page."}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
