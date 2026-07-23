"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { useTheme } from "next-themes";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { setUserData } from "@/redux/reducers/auth/authSlice";
import { cn, globalError, handleLogout } from "@/lib/utils";
import { connectSocket, disconnectSocket, socket } from "@/lib/socket";
import { SidebarProvider, useSidebar } from "../ui/sidebar";
import { AppSidebar } from "../shared/AppSidebar";
import { Toaster } from "sonner";
import { Loader } from "lucide-react";
import Image from "next/image";
import { LoadingScreen } from "../shared/LoadingScreen";

const MainLayout = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();
  const [hydrated, setHydrated] = useState(false);
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const initilaAction = async () => {
      await connectSocket();
      socket?.emit("adminJoin", { user: user?._id });
    };

    initilaAction();

    return () => {
      disconnectSocket();
    };
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      axiosInstance
        .get("/auth/getMyData")
        .then((res) => {
          if (res?.data?.data?.isDeleted === true) {
            handleLogout();
          }
          dispatch(
            setUserData({
              user: res?.data?.data,
              permissions: res.data?.data?.role?.permissions,
            }),
          );
          setLoading(false);
        })
        .catch((err) => {
          globalError(err);
          setLoading(false);
        });
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, router, dispatch]);

  const { state } = useSidebar();

  if (loading) {
    return (
      <div className="flex  w-full gap-2 flex-col items-center justify-center h-[80vh]">
        <Image
          src={
            theme !== "dark"
              ? "/logo/dailyit-logo-black.png"
              : "/logo/dailyit-logo-white.png"
          }
          width={320}
          height={170}
          className={"w-28 h-fit"}
          alt="logo"
        />
        <div className="flex items-center justify-center flex-col mt-3 gap-1">
          <LoadingScreen />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      {hydrated ? (
        <div className="flex bg-background-foreground w-full">
          <AppSidebar />
          <main
            className={`relative bg-background ${state === "expanded" ? "md:w-[calc(100%-256px)]" : "md:w-[calc(100%-48px)]"} w-full`}
          >
            <Navbar />
            <div className="w-full rounded-md bg-background p-3">
              {children}
            </div>
          </main>
          <Toaster richColors closeButton position="top-center" />
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default MainLayout;
