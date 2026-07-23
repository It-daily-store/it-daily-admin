import React, { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useGetNotificationsQuery } from "@/redux/api/notificationApi";
import UserCard from "../common/UserCard";
import dayjs from "../utilities/Customdayjs";
import { TNotification } from "@/interface/notification.interface";
import { socket } from "@/lib/socket";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { handleNotificationClick } from "../utilities/notifications/handleNotificationClick";
import { useRouter } from "nextjs-toploader/app";
import { Bell } from "lucide-react";
import BadgeButtton from "../ui/BadgeButtton";

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

  const goToRoute = (route: string) => {
    router.push(route);
  };

  const handleClick = (noti: TNotification) => {
    if (!noti.opened) {
      socket?.emit("notificationClicked", noti._id);
    }

    handleNotificationClick(noti, goToRoute);
  };

  useEffect(() => {
    const handleNewNoti = (payload: TNotification) => {
      console.log({ payload });
      const audio = new Audio("/notification_2.wav");
      audio.play().catch((err) => console.log(err));
      toast(payload.text || "new notification", {
        position: "bottom-right",
      });

      setNotifications((prev) => [payload, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleRead = (data: TNotification) => {
      const markedNoti = notifications?.find((noti) => noti?._id === data?._id);
      if (markedNoti) {
        setNotifications(
          (prev) =>
            prev.map((noti: TNotification) => {
              if (noti?._id === markedNoti?._id) {
                return { ...markedNoti, opened: true };
              } else {
                return noti;
              }
            }) || [],
        );
        setUnreadCount((prev) => prev - 1);
      }
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
  });

  useEffect(() => {
    if (data?.data) {
      if (data.data?.notifications) {
        for (const noti of data.data.notifications) {
          const exist = notifications.find((nt) => noti._id === nt._id);
          if (!exist) {
            setNotifications((prev) => [...prev, noti]);
          }
        }
      }

      setUnreadCount(data?.data?.unreadCount);
    }
  }, [data?.data]);

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <BadgeButtton
          variant={"bordered"}
          className="size-8 bg-background"
          icon={<Bell size={18} />}
          count={unreadCount}
          tooptip="Notificatons"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="-right-10 w-80 p-2 bg-background border border-border-color">
        <DropdownMenuLabel>
          <div className="pb-1 mb-2 border-b border-border-color flex justify-between">
            <p className="font-semibold text-lg">Notifications</p>
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-primary cursor-pointer"
            >
              Mark all as read
            </button>
          </div>
        </DropdownMenuLabel>

        <div
          onScroll={handleScroll}
          className="w-full pb-2 custom-scrollbar space-y-2 max-h-72 overflow-y-auto"
          ref={containerRef}
        >
          {notifications?.map((noti) => (
            <div
              onClick={() => handleClick(noti)}
              key={noti._id}
              className={`${noti?.opened ? "bg-background" : "bg-secondary/10"} border border-border-color px-3 py-1 rounded-md shadow-md cursor-pointer`}
            >
              <p className="font-semibold text-sm line-clamp-2 pb-2">
                {noti?.text}
              </p>
              <div className="flex justify-between">
                <UserCard size="sm" user={noti.userFrom} />
                <div className="text-xs text-gray">
                  {dayjs(noti?.createdAt)?.fromNow()}
                </div>
              </div>
            </div>
          ))}
          {(isFetching || isLoading) &&
            Array.from({ length: 4 }, (_, i) => (
              <div
                className="bg-background border border-border-color px-3 py-1 rounded-md shadow-md cursor-pointer space-y-1"
                key={i}
              >
                <Skeleton className="h-3 w-full bg-background-foreground" />
                <div className="flex w-full gap-1 items-center">
                  <Skeleton className="h-8 w-9 bg-background-foreground rounded-full" />
                  <div className="w-full">
                    <Skeleton className="h-3 w-1/2 bg-background-foreground" />
                    <Skeleton className="h-2 mt-1 w-1/3 bg-background-foreground" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMenu;
