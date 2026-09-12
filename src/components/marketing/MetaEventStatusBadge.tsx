"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TSentEventStatus } from "@/interface/metaPixel.interface";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

type TStatusDisplay = {
  label: string;
  className: string;
  hint: string;
};

// `sent` reuses the delivered-order badge classes so success reads the same across the admin.
export const SENT_EVENT_STATUS: Record<TSentEventStatus, TStatusDisplay> = {
  queued: {
    label: "Queued",
    className: "bg-muted text-muted-foreground",
    hint: "Waiting in the send queue. It usually leaves within a few seconds.",
  },
  sent: {
    label: "Sent",
    className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
    hint: "Meta accepted this event.",
  },
  failed: {
    label: "Failed",
    className: "bg-warning/12 text-warning",
    hint: "The send failed and will be retried automatically.",
  },
  dead: {
    label: "Dead",
    className: "bg-destructive/12 text-destructive",
    hint: "Every automatic retry was used up. This event will not be sent again unless you retry it.",
  },
};

export const MetaEventStatusBadge = ({
  status,
  className,
}: {
  status: TSentEventStatus;
  className?: string;
}) => {
  const display = SENT_EVENT_STATUS[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
    hint: "Unrecognised status.",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "cursor-help border-transparent font-medium",
            display.className,
            className,
          )}
        >
          {display.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{display.hint}</TooltipContent>
    </Tooltip>
  );
};

export const CopyableId = ({
  value,
  label,
  className,
}: {
  value?: string;
  label: string;
  className?: string;
}) => {
  const [copied, setCopied] = useState(false);

  if (!value) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked; the value stays selectable in the tooltip.
      setCopied(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${label} ${value}`}
          className={cn(
            "hover:bg-muted focus-visible:ring-ring flex max-w-full items-center gap-1 rounded px-1 py-0.5 font-mono text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none",
            className,
          )}
        >
          <span className="truncate">{value}</span>
          {copied ? (
            <Check size={12} className="shrink-0" />
          ) : (
            <Copy size={12} className="shrink-0 opacity-50" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs font-mono text-xs break-all">
        {copied ? "Copied" : `${value} — click to copy`}
      </TooltipContent>
    </Tooltip>
  );
};
