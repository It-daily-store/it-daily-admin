"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TMetaPixelSentEvent } from "@/interface/metaPixel.interface";
import { format } from "date-fns";
import { Activity } from "lucide-react";
import { CopyableId, MetaEventStatusBadge } from "./MetaEventStatusBadge";

type TProps = {
  sentEvents?: TMetaPixelSentEvent[];
};

const OrderMetaEventsCard = ({ sentEvents }: TProps) => {
  if (!sentEvents?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Meta Pixel Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sentEvents.map((event) => (
          <div
            key={event.eventId || event.eventName}
            className="border-border-color space-y-1.5 border-b pb-3 last:border-0 last:pb-0"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-medium">
                {event.eventName}
              </span>
              <MetaEventStatusBadge status={event.status} />
            </div>

            <div className="text-dark-gray flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span>
                {event.attempts === 1
                  ? "1 attempt"
                  : `${event.attempts} attempts`}
              </span>
              <span>
                {event.sentAt
                  ? format(new Date(event.sentAt), "dd MMM yyyy, hh:mm a")
                  : "Not sent yet"}
              </span>
            </div>

            <CopyableId value={event.eventId} label="event ID" />

            {event.errorMessage && (
              <p
                role="alert"
                className="border-destructive/40 bg-destructive/5 text-destructive rounded-md border px-2 py-1.5 text-xs"
              >
                {event.errorMessage}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default OrderMetaEventsCard;
