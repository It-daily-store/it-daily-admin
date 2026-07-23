"use client";
import { TUser } from "@/interface/auth.interface";
import { globalError } from "@/lib/utils";
import { useGetSingleUserQuery } from "@/redux/api/usersApi";
import React, { use } from "react";

const AdminDetails = (props: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = use(props.params);
  const userId = params.userId;

  const { data, error, isLoading } = useGetSingleUserQuery({
    id: userId,
    userType: "admin",
  });

  if (error) {
    globalError(error);
  }

  const userData: TUser = data?.data;

  return (
    <div>
      {!isLoading && userData && (
        <div className="flex items-center justify-between pb-4">
          <h4 className="page-title">Admin Info {`: ${userData?.fullName}`}</h4>
        </div>
      )}
    </div>
  );
};

export default AdminDetails;
