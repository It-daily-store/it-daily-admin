"use client";
import React from "react";
import { IStatusHistory } from "@/interface/order.interface";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import dayjs from "../utilities/Customdayjs";
import { getOrderStatusConfig } from "./orderStatus";

const getInitials = (fullName?: string) =>
  (fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

const OrderStatusTimeline = ({ history }: { history: IStatusHistory[] }) => {
  if (!history?.length) {
    return (
      <p className="py-4 text-center text-[13px] text-foreground/50">
        No status updates yet.
      </p>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-3.5 bottom-3.5 left-[13px] w-0.5 rounded bg-border" />

      {history.map((entry, index) => {
        const config = getOrderStatusConfig(entry.status);
        const Icon = config.icon;
        const isCurrent = index === history.length - 1;
        const actor = entry.updatedBy;

        return (
          <div key={index} className="relative flex gap-3 pb-4 last:pb-0">
            <div
              className={cn(
                "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full ring-[3px] ring-background",
                config.node,
                isCurrent && "ring-[3px] ring-primary/25",
              )}
            >
              <Icon size={14} />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-[13px] leading-tight font-semibold">
                  {config.label}
                </p>
                {isCurrent && (
                  <span className="rounded-full bg-primary px-1.5 py-px text-[9px] font-bold tracking-wide text-pure-white uppercase">
                    Current
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-[11px] text-foreground/50">
                {dayjs(entry.timestamp).format("MMM D, YYYY · h:mm A")}
              </p>

              {entry.notes && (
                <div className="mt-1.5 rounded-r-md border-l-2 border-primary bg-primary/5 px-2.5 py-1.5">
                  <p className="text-[10px] font-bold tracking-wide text-primary uppercase">
                    Note
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-foreground/80">
                    {entry.notes}
                  </p>
                </div>
              )}

              {actor ? (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Avatar className="size-[18px]">
                    <AvatarImage
                      className="object-cover"
                      src={actor.profilePicture}
                    />
                    <AvatarFallback className="bg-secondary text-[8px] font-bold text-secondary-foreground">
                      {getInitials(actor.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-[11px] text-foreground/55">
                    {actor.fullName || actor.email}
                  </span>
                </div>
              ) : (
                <p className="mt-1.5 text-[10px] font-semibold tracking-wide text-foreground/40 uppercase">
                  {entry.status === "pending" ? "By customer" : "Automatic"}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStatusTimeline;
