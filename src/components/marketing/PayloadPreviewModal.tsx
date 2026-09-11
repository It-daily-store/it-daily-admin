"use client";

import Modal from "@/components/custom/Modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { globalError } from "@/lib/utils";
import { usePreviewMetaPixelPayloadMutation } from "@/redux/api/metaPixelApi";
import { AlertTriangle, Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

type TProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerKey?: string;
  statusRuleId?: string;
  subject?: string;
};

const extractMessage = (err: unknown): string => {
  const data = (err as { data?: { errorSources?: { message?: string }[] } })
    ?.data;
  return (
    data?.errorSources?.[0]?.message ??
    "The payload could not be built. Check the Setup tab and try again."
  );
};

const PayloadPreviewModal = ({
  open,
  onOpenChange,
  triggerKey,
  statusRuleId,
  subject,
}: TProps) => {
  const [previewPayload, { isLoading }] = usePreviewMetaPixelPayloadMutation();

  const [json, setJson] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setErrorMessage(null);
    setJson(null);
    try {
      const res = await previewPayload({ triggerKey, statusRuleId }).unwrap();
      setJson(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setErrorMessage(extractMessage(err));
    }
  };

  useEffect(() => {
    if (!open) {
      setJson(null);
      setErrorMessage(null);
      setCopied(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, triggerKey, statusRuleId]);

  const handleCopy = async () => {
    if (!json) return;
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      globalError(err);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Payload preview"
      className="sm:max-w-2xl"
    >
      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          This is exactly what would be sent to Meta. Nothing was sent.
          {subject ? ` Previewing ${subject}.` : ""}
        </p>

        {isLoading && (
          <div className="flex flex-col gap-2" aria-live="polite">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-56 w-full rounded" />
          </div>
        )}

        {!isLoading && errorMessage && (
          <div
            role="alert"
            className="border-destructive/40 bg-destructive/5 rounded-md border p-3 text-sm"
          >
            <p className="text-destructive flex items-center gap-2 font-medium">
              <AlertTriangle size={16} />
              No payload could be built
            </p>
            <p className="text-muted-foreground mt-1">{errorMessage}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={load}
            >
              Try again
            </Button>
          </div>
        )}

        {!isLoading && json && (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">
                Built from the saved configuration and a recent sample order.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCopy}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy JSON"}
              </Button>
            </div>
            <pre className="bg-muted max-h-96 overflow-auto rounded p-3 font-mono text-xs">
              {json}
            </pre>
          </>
        )}
      </div>
    </Modal>
  );
};

export default PayloadPreviewModal;
