import { TUser } from "@/interface/auth.interface";
import { useGetAllAdminsQuery } from "@/redux/api/usersApi";
import { useCallback } from "react";

const useGetAdminData = () => {
  const { data, isFetching, isLoading } = useGetAllAdminsQuery(undefined);

  const findAdmin = useCallback(
    (id: string) => {
      const adminData = data?.data || ([] as TUser[]);
      const admin = adminData.find((a: TUser) => a?._id === id || a._id === id);
      return admin;
    },
    [data?.data, isLoading, isFetching],
  );

  return { findAdmin };
};
export default useGetAdminData;
