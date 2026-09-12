"use client";

import GlobalTable, {
  TCustomColumnDef,
} from "@/components/common/GlobalTable/GlobalTable";
import PageHeader from "@/components/common/PageHeader";
import Modal from "@/components/custom/Modal";
import PermissionGuard from "@/components/global/PermissionGuard";
import {
  CopyableId,
  MetaEventStatusBadge,
} from "@/components/marketing/MetaEventStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import useDebounce from "@/hooks/useDebounce";
import { TMetaPixelLog } from "@/interface/metaPixel.interface";
import { useCan } from "@/lib/permissions";
import { globalError } from "@/lib/utils";
import {
  useGetMetaPixelLogsQuery,
  useRetryMetaPixelEventMutation,
} from "@/redux/api/metaPixelApi";
import { format } from "date-fns";
import {
  AlertTriangle,
  RotateCw,
  ScrollText,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "queued", label: "Queued" },
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
  { value: "dead", label: "Dead" },
];

const SOURCE_OPTIONS = [
  { value: "all", label: "All sources" },
  { value: "status_rule", label: "Order status rule" },
  { value: "browser_backup", label: "Browser backup" },
  { value: "manual", label: "Manual retry" },
  { value: "test_connection", label: "Test connection" },
];

const SOURCE_LABELS: Record<string, string> = {
  status_rule: "Order status rule",
  browser_backup: "Browser backup",
  manual: "Manual retry",
  test_connection: "Test connection",
};

const toJson = (value: unknown) =>
  value === undefined || value === null
    ? "No data"
    : JSON.stringify(value, null, 2);

const MetaPixelLogsView = () => {
  const can = useCan();
  const canRetry = can("can_retry_meta_pixel_event");

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const status = searchParams.get("status") ?? "all";
  const source = searchParams.get("source") ?? "all";
  const eventName = searchParams.get("eventName") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;

  const hasActiveFilters = Boolean(
    (status && status !== "all") ||
      (source && source !== "all") ||
      eventName ||
      from ||
      to,
  );

  const [eventNameInput, setEventNameInput] = useState(eventName);
  const debouncedEventName = useDebounce(eventNameInput, 400);

  const [viewLog, setViewLog] = useState<TMetaPixelLog | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const [retryEvent, { isLoading: isRetrying }] =
    useRetryMetaPixelEventMutation();

  // Filters live in the URL so a diagnostic view can be shared as a link.
  const applyFilters = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());

    Object.entries(patch).forEach(([key, value]) => {
      if (!value || value === "all") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    if (!("page" in patch)) next.delete("page");

    const queryString = next.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  useEffect(() => {
    if (debouncedEventName.trim() === eventName) return;
    applyFilters({ eventName: debouncedEventName.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedEventName]);

  useEffect(() => {
    setEventNameInput(eventName);
  }, [eventName]);

  const { data, isLoading, isFetching, error } = useGetMetaPixelLogsQuery({
    page,
    limit,
    ...(status !== "all" ? { status } : {}),
    ...(source !== "all" ? { source } : {}),
    ...(eventName ? { eventName } : {}),
    ...(from ? { from } : {}),
    // The picker gives a date only, so the end of that day is what an operator means by "to".
    ...(to ? { to: `${to}T23:59:59.999` } : {}),
  });

  if (!isLoading && error) globalError(error);

  const logs = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const handleRetry = async (log: TMetaPixelLog) => {
    setRetryingId(log._id);
    try {
      const res = await retryEvent(log._id).unwrap();
      toast.success(res.message);
      setViewLog(null);
    } catch (err) {
      globalError(err);
    } finally {
      setRetryingId(null);
    }
  };

  const clearFilters = () => {
    setEventNameInput("");
    router.replace(pathname, { scroll: false });
  };

  const defaultColumns: TCustomColumnDef<TMetaPixelLog>[] = [
    {
      accessorKey: "createdAt",
      header: "Time",
      cell: ({ row }) => (
        <p className="text-xs">
          {format(new Date(row.original.createdAt), "dd MMM yyyy, hh:mm a")}
        </p>
      ),
      id: "createdAt",
      minSize: 160,
      maxSize: 200,
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "eventName",
      header: "Event",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs font-medium">
            {row.original.eventName}
          </span>
          <CopyableId value={row.original.eventId} label="event ID" />
        </div>
      ),
      id: "eventName",
      minSize: 200,
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => (
        <p className="text-xs">
          {SOURCE_LABELS[row.original.source] ?? row.original.source}
        </p>
      ),
      id: "source",
      minSize: 140,
      maxSize: 180,
      visible: true,
      canHide: true,
    },
    {
      accessorKey: "orderId",
      header: "Order",
      cell: ({ row }) => {
        const order = row.original.orderId;

        if (!order?.orderNumber) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }

        return (
          <Link
            href={`/orders/${order.orderNumber}`}
            className="text-primary text-xs hover:underline"
          >
            #{order.orderNumber}
          </Link>
        );
      },
      id: "orderId",
      minSize: 130,
      maxSize: 170,
      visible: true,
      canHide: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <MetaEventStatusBadge status={row.original.status} />,
      id: "status",
      minSize: 110,
      maxSize: 140,
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "attempts",
      header: "Attempts",
      cell: ({ row }) => <p className="text-xs">{row.original.attempts}</p>,
      id: "attempts",
      minSize: 90,
      maxSize: 110,
      visible: true,
      canHide: true,
    },
    {
      accessorKey: "fbtraceId",
      header: "Meta trace ID",
      cell: ({ row }) => (
        <CopyableId value={row.original.fbtraceId} label="Meta trace ID" />
      ),
      id: "fbtraceId",
      minSize: 160,
      visible: true,
      canHide: true,
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const log = row.original;
        const retryable = log.status === "failed" || log.status === "dead";

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="view_button"
              size="base"
              tooltip="View the payload and Meta's response"
              aria-label={`View the ${log.eventName} event sent at ${format(
                new Date(log.createdAt),
                "dd MMM yyyy, hh:mm a",
              )}`}
              onClick={() => setViewLog(log)}
            />
            {retryable && canRetry && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                tooltip="Send this event to Meta again"
                loading={isRetrying && retryingId === log._id}
                onClick={() => handleRetry(log)}
              >
                <RotateCw size={14} />
                Retry
              </Button>
            )}
          </div>
        );
      },
      id: "actions",
      minSize: 160,
      maxSize: 200,
      visible: true,
      canHide: false,
    },
  ];

  const showEmptyState = !isLoading && logs.length === 0;

  return (
    <div>
      <PageHeader
        title="Meta Pixel event log"
        subtitle="Every event sent to Meta, with the response"
        buttons={
          <Button variant="outline" asChild>
            <Link href="/marketing/meta-pixel">
              <SlidersHorizontal size={16} />
              Pixel settings
            </Link>
          </Button>
        }
      />

      <section className="bg-card mb-4 rounded-lg border p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="log-status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => applyFilters({ status: value })}
            >
              <SelectTrigger id="log-status" className="bg-background w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="log-source">Source</Label>
            <Select
              value={source}
              onValueChange={(value) => applyFilters({ source: value })}
            >
              <SelectTrigger id="log-source" className="bg-background w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="log-event-name">Event name</Label>
            <Input
              id="log-event-name"
              value={eventNameInput}
              onChange={(e) => setEventNameInput(e.target.value)}
              placeholder="Purchase"
              className="bg-background"
            />
            <p className="text-muted-foreground text-xs">
              An exact Meta event name, for example Purchase.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="log-from">From</Label>
            <Input
              id="log-from"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => applyFilters({ from: e.target.value })}
              className="bg-background"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="log-to">To</Label>
            <Input
              id="log-to"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => applyFilters({ to: e.target.value })}
              className="bg-background"
            />
            <p className="text-muted-foreground text-xs">
              Both days are included.
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
            <p className="text-muted-foreground text-xs">
              These filters are part of the page address, so this view can be
              shared as a link.
            </p>
          </div>
        )}
      </section>

      {showEmptyState ? (
        <div className="bg-card rounded-lg border border-dashed p-8 text-center">
          <ScrollText
            size={28}
            className="text-muted-foreground mx-auto mb-3"
            aria-hidden
          />
          {hasActiveFilters ? (
            <>
              <p className="text-sm font-semibold">
                No events match these filters
              </p>
              <p className="text-muted-foreground mx-auto mt-1 max-w-md text-sm">
                Events exist in the log, but none of them match the status,
                source, event name or date range you chose. Widen the range or
                clear the filters to see everything.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">No events yet</p>
              <p className="text-muted-foreground mx-auto mt-1 max-w-md text-sm">
                Nothing has been sent to Meta so far. Run Test connection on the
                Setup tab to send one, or wait for an order to reach a status
                that has a rule.
              </p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/marketing/meta-pixel">Go to Pixel settings</Link>
              </Button>
            </>
          )}
        </div>
      ) : (
        <>
          <GlobalTable
            tableName="metaPixelLogs"
            defaultColumns={defaultColumns}
            data={logs}
            isLoading={isLoading || isFetching}
            limit={limit}
          />
          <div className="mt-4 flex justify-end">
            <Pagination
              currentPage={page}
              itemsPerPage={limit}
              totalItems={total}
              onPageChange={(nextPage, nextLimit) =>
                applyFilters({ page: nextPage, limit: nextLimit })
              }
            />
          </div>
        </>
      )}

      <Modal
        open={viewLog !== null}
        onOpenChange={(open) => !open && setViewLog(null)}
        title="Event detail"
        className="sm:max-w-5xl"
      >
        {viewLog && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <span className="font-mono text-sm font-medium">
                {viewLog.eventName}
              </span>
              <MetaEventStatusBadge status={viewLog.status} />
              <span className="text-muted-foreground">
                {format(new Date(viewLog.createdAt), "dd MMM yyyy, hh:mm a")}
              </span>
              <span className="text-muted-foreground">
                {SOURCE_LABELS[viewLog.source] ?? viewLog.source}
              </span>
              <span className="text-muted-foreground">
                {viewLog.attempts === 1
                  ? "1 attempt"
                  : `${viewLog.attempts} attempts`}
              </span>
              {viewLog.httpStatus && (
                <span className="text-muted-foreground">
                  HTTP {viewLog.httpStatus}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Event ID</span>
                <CopyableId value={viewLog.eventId} label="event ID" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  Meta trace ID
                </span>
                <CopyableId value={viewLog.fbtraceId} label="Meta trace ID" />
              </div>
            </div>

            {viewLog.errorMessage && (
              <div
                role="alert"
                className="border-destructive/40 bg-destructive/5 rounded-md border p-3 text-sm"
              >
                <p className="text-destructive flex items-center gap-2 font-medium">
                  <AlertTriangle size={16} />
                  Meta rejected this event
                </p>
                <p className="text-muted-foreground mt-1 font-mono text-xs break-words">
                  {viewLog.errorMessage}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold">Payload sent</p>
                <pre className="bg-muted max-h-96 overflow-auto rounded p-3 font-mono text-xs">
                  {toJson(viewLog.payload)}
                </pre>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold">
                  Meta&apos;s response
                </p>
                <pre className="bg-muted max-h-96 overflow-auto rounded p-3 font-mono text-xs">
                  {toJson(viewLog.metaResponse)}
                </pre>
              </div>
            </div>

            {(viewLog.status === "failed" || viewLog.status === "dead") &&
              canRetry && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    loading={isRetrying}
                    onClick={() => handleRetry(viewLog)}
                  >
                    <RotateCw size={14} />
                    Retry this event
                  </Button>
                </div>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
};

const MetaPixelLogsPage = () => (
  <PermissionGuard permission="can_read_meta_pixel_logs">
    {/* useSearchParams needs a Suspense boundary or the route cannot be prerendered. */}
    <Suspense fallback={<Skeleton className="h-[32rem] w-full rounded-lg" />}>
      <MetaPixelLogsView />
    </Suspense>
  </PermissionGuard>
);

export default MetaPixelLogsPage;
