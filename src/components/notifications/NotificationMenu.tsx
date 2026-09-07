"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useGetNotificationsQuery } from "@/redux/api/notificationApi";
import { TNotification } from "@/interface/notification.interface";
import { socket } from "@/lib/socket";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "nextjs-toploader/app";
import { Bell, BellOff } from "lucide-react";
import BadgeButtton from "../ui/BadgeButtton";
import { useAppSelector } from "@/redux/hooks";
import NotificationItem from "./NotificationItem";
import { resolveNotificationRoute } from "./resolveNotificationRoute";
import {
  buildNotificationMessage,
  flattenMessage,
} from "./buildNotificationMessage";

const NotificationMenu = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetNotificationsQuery(
    {
      page,
      limit: 20,
    },
    { refetchOnMountOrArgChange: true },
  );
  const [notifications, setNotifications] = useState<TNotification[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const currentUserId = user?._id;
  const currentUserIdRef = useRef(currentUserId);
  currentUserIdRef.current = currentUserId;

  const handleClick = (noti: TNotification) => {
    if (!noti.opened) {
      socket?.emit("notificationClicked", noti._id);
    }

    const route = resolveNotificationRoute(noti);
    if (route) {
      router.push(route);
    }
  };

  useEffect(() => {
    const handleNewNoti = (payload: TNotification) => {
      const audio = new Audio("/notification_2.wav");
      audio.play().catch((err) => console.log(err));

      const message = flattenMessage(
        buildNotificationMessage(payload, currentUserIdRef.current),
      );
      toast(message || "New notification", { position: "bottom-right" });

      setNotifications((prev) => [payload, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleRead = (updated: TNotification) => {
      if (!updated?._id) return;

      setNotifications((prev) =>
        prev.map((noti) =>
          noti._id === updated._id ? { ...noti, opened: true } : noti,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const handleUpdateMarkAllRead = () => {
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((noti) => ({ ...noti, opened: true })),
      );
    };

    socket?.on("newNotification", handleNewNoti);
    socket?.on("notificationRead", handleRead);
    socket?.on("markedAllasRead", handleUpdateMarkAllRead);

    return () => {
      socket?.off("newNotification", handleNewNoti);
      socket?.off("notificationRead", handleRead);
      socket?.off("markedAllasRead", handleUpdateMarkAllRead);
    };
  }, []);

  useEffect(() => {
    const incoming = data?.data?.notifications;
    if (!incoming) return;

    setNotifications((prev) => {
      const merged = new Map(prev.map((noti) => [noti._id, noti]));
      for (const noti of incoming) {
        merged.set(noti._id, noti);
      }
      return [...merged.values()];
    });

    setUnreadCount(data.data.unreadCount || 0);
  }, [data]);

  const handleScroll = () => {
    if (!containerRef.current || isLoading || isFetching) {
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    if (
      scrollTop + clientHeight > scrollHeight - 30 &&
      data?.pagination?.hasMore
    ) {
      setPage((prev) => prev + 1);
    }
  };

  const handleMarkAllRead = () => {
    socket?.emit("markAllRead");
  };

  const isBusy = isLoading || isFetching;
  const isEmpty = !isBusy && notifications.length === 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <BadgeButtton
          variant={"bordered"}
          className="size-8 bg-background"
          icon={<Bell size={18} />}
          count={unreadCount}
          tooptip="Notifications"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="-right-10 w-84 border border-border-color bg-background p-2">
        <DropdownMenuLabel className="p-0">
          <div className="mb-1.5 flex items-center justify-between border-b border-border-color px-1 pb-2">
            <p className="text-sm font-semibold tracking-tight">
              Notifications
            </p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="cursor-pointer text-[11px] font-medium text-primary"
              >
                Mark all as read
              </button>
            )}
          </div>
        </DropdownMenuLabel>

        <div
          onScroll={handleScroll}
          className="custom-scrollbar max-h-80 w-full space-y-0.5 overflow-y-auto"
          ref={containerRef}
        >
          {notifications.map((noti) => (
            <NotificationItem
              key={noti._id}
              noti={noti}
              currentUserId={currentUserId}
              onSelect={handleClick}
            />
          ))}

          {isEmpty && (
            <div className="flex flex-col items-center gap-1.5 px-3 py-8 text-center">
              <BellOff className="text-foreground/25" size={22} />
              <p className="text-[13px] font-medium">No notifications yet</p>
              <p className="text-[11px] text-foreground/50">
                Activity from your team will show up here.
              </p>
            </div>
          )}

          {isBusy &&
            Array.from({ length: 4 }, (_, i) => (
              <div className="flex items-start gap-2.5 px-2.5 py-2.5" key={i}>
                <Skeleton className="size-8.5 shrink-0 rounded-[10px] bg-background-foreground" />
                <div className="w-full space-y-1.5">
                  <Skeleton className="h-3 w-full bg-background-foreground" />
                  <Skeleton className="h-2.5 w-1/3 bg-background-foreground" />
                </div>
              </div>
            ))}

          {!isBusy && !isEmpty && !data?.pagination?.hasMore && (
            <p className="py-2.5 text-center text-[11px] text-foreground/40">
              You&apos;re all caught up
            </p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMenu;
