"use client";
import React from "react";
import { TNotification } from "@/interface/notification.interface";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import dayjs from "../utilities/Customdayjs";
import {
  buildNotificationMessage,
  flattenMessage,
  TMessageSegment,
} from "./buildNotificationMessage";
import {
  actionToneClasses,
  fallbackIcon,
  notificationConfig,
} from "./notificationConfig";

const toneClasses: Record<TMessageSegment["tone"], string> = {
  actor: "font-semibold text-foreground",
  verb: "font-normal text-foreground/60",
  entity: "font-medium text-foreground",
};

const getInitials = (noti: TNotification) => {
  const { fullName, name } = noti.userFrom || {};
  const source = fullName || `${name?.firstName || ""} ${name?.lastName || ""}`;

  return (
    source
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
};

const NotificationItem = ({
  noti,
  currentUserId,
  onSelect,
}: {
  noti: TNotification;
  currentUserId?: string;
  onSelect: (_noti: TNotification) => void;
}) => {
  const config = notificationConfig[noti.notificationType];
  const Icon = config?.icon || fallbackIcon;
  const segments = buildNotificationMessage(noti, currentUserId);
  const fullText = flattenMessage(segments);
  const role = noti.userFrom?.role?.role;

  return (
    <button
      type="button"
      title={fullText}
      onClick={() => onSelect(noti)}
      className={cn(
        "flex w-full cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-foreground/[0.04]",
        !noti.opened && "bg-primary/[0.055]",
      )}
    >
      <div className="relative mt-px size-8.5 shrink-0">
        <div
          className={cn(
            "flex size-8.5 items-center justify-center rounded-[10px]",
            actionToneClasses[noti.actionType] || "bg-muted text-foreground/70",
          )}
        >
          <Icon size={17} />
        </div>
        <Avatar className="absolute -right-[3px] -bottom-[3px] size-[17px] ring-2 ring-background">
          <AvatarImage
            className="object-cover"
            src={noti.userFrom?.profilePicture}
          />
          <AvatarFallback className="bg-secondary text-[7px] font-bold text-secondary-foreground">
            {getInitials(noti)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[13px] leading-snug">
          {segments.map((segment, i) => (
            <React.Fragment key={i}>
              {i > 0 && " "}
              <span className={toneClasses[segment.tone]}>{segment.text}</span>
            </React.Fragment>
          ))}
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-foreground/50">
          {role && (
            <>
              <span className="capitalize">{role}</span>
              <span>·</span>
            </>
          )}
          <span>{dayjs(noti?.createdAt).fromNow()}</span>
        </div>
      </div>

      {!noti.opened && (
        <span className="mt-[13px] size-1.5 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  );
};

export default NotificationItem;
