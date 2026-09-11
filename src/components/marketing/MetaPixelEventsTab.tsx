"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  META_STANDARD_EVENTS,
  TMetaPixelConfig,
  TMetaPixelTrigger,
  TRIGGER_LABELS,
} from "@/interface/metaPixel.interface";
import { useCan } from "@/lib/permissions";
import { cn, globalError } from "@/lib/utils";
import { useUpdateMetaPixelConfigMutation } from "@/redux/api/metaPixelApi";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ControlWithReason,
  READ_ONLY_REASON,
  ReadOnlyNotice,
  SectionCard,
} from "./MetaPixelSetupTab";
import PayloadPreviewModal from "./PayloadPreviewModal";

const CUSTOM_OPTION = "__custom__";

const EVENT_NAME_PATTERN = /^[A-Za-z0-9_ ]+$/;

const eventNameFieldId = (key: string) => `meta-trigger-event-${key}`;

// The registry order is the storefront journey order, so the table reads top to bottom.
const orderTriggers = (triggers: TMetaPixelTrigger[]): TMetaPixelTrigger[] => {
  const registryKeys = Object.keys(TRIGGER_LABELS);
  const known = registryKeys
    .map((key) => triggers.find((t) => t.key === key))
    .filter((t): t is TMetaPixelTrigger => Boolean(t));
  const unknown = triggers.filter((t) => !registryKeys.includes(t.key));
  return [...known, ...unknown].map((t) => ({ ...t }));
};

const validateRow = (row: TMetaPixelTrigger): string | null => {
  const eventName = row.eventName.trim();

  if (row.enabled && !eventName) {
    return "This trigger is enabled but has no Meta event. Pick a standard event, or choose Custom and type a name.";
  }

  if (eventName && !EVENT_NAME_PATTERN.test(eventName)) {
    return "An event name may only contain letters, digits, underscores and spaces. Remove any other character.";
  }

  return null;
};

const MetaPixelEventsTab = ({ config }: { config: TMetaPixelConfig }) => {
  const can = useCan();
  const readOnly = !can("can_update_marketing");

  const [updateConfig, { isLoading: isSaving }] =
    useUpdateMetaPixelConfigMutation();

  const [rows, setRows] = useState<TMetaPixelTrigger[]>(
    orderTriggers(config.triggers ?? []),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewKey, setPreviewKey] = useState<string | null>(null);

  useEffect(() => {
    setRows(orderTriggers(config.triggers ?? []));
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.updatedAt]);

  const baseline = orderTriggers(config.triggers ?? []);
  const isDirty = JSON.stringify(rows) !== JSON.stringify(baseline);

  const patchRow = (key: string, patch: Partial<TMetaPixelTrigger>) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};
    rows.forEach((row) => {
      const error = validateRow(row);
      if (error) nextErrors[row.key] = error;
    });

    setErrors(nextErrors);

    const firstInvalid = rows.find((row) => nextErrors[row.key]);
    if (firstInvalid) {
      document.getElementById(eventNameFieldId(firstInvalid.key))?.focus();
      return;
    }

    try {
      const res = await updateConfig({
        triggers: rows.map((row) => ({
          key: row.key,
          eventName: row.eventName.trim(),
          isCustomEvent: row.isCustomEvent,
          enabled: row.enabled,
          sendViaBrowser: row.sendViaBrowser,
          sendViaCapi: row.sendViaCapi,
        })),
      }).unwrap();
      toast.success(res.message);
    } catch (err) {
      globalError(err);
    }
  };

  const enabledCount = rows.filter((row) => row.enabled).length;

  const previewTrigger = previewKey
    ? baseline.find((row) => row.key === previewKey)
    : undefined;

  return (
    <div className="flex flex-col gap-4">
      {readOnly && <ReadOnlyNotice />}

      <SectionCard
        title="Storefront trigger registry"
        description={`Each storefront trigger point is mapped to a Meta event here, with independent browser and server-side delivery. ${enabledCount} of ${rows.length} triggers are enabled.`}
      >
        {rows.length === 0 ? (
          <p className="text-muted-foreground rounded-md border border-dashed px-3 py-6 text-sm">
            No storefront triggers are registered. The registry is defined in
            code, so this usually means the configuration failed to load —
            reload the page, and contact a developer if it stays empty.
          </p>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-card sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="min-w-56">Trigger</TableHead>
                    <TableHead className="min-w-56">Meta event</TableHead>
                    <TableHead className="text-center">Enabled</TableHead>
                    <TableHead className="text-center">Browser</TableHead>
                    <TableHead className="text-center">CAPI</TableHead>
                    <TableHead className="text-right">Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const meta = TRIGGER_LABELS[row.key];
                    const backendVisible = meta?.backendVisible ?? false;
                    const error = errors[row.key];
                    const savedRow = baseline.find((b) => b.key === row.key);

                    // A trigger with no server-side counterpart can never send, so that
                    // reason outranks the reversible "CAPI is off" one.
                    const capiDisabledReason = !backendVisible
                      ? "This trigger has no server-side counterpart. It fires only in the browser, so there is nothing for the Conversions API to send."
                      : !config.capiEnabled
                        ? "Finish Setup to enable the Conversions API. Save an access token, run Test connection, then switch server-side sending on."
                        : readOnly
                          ? READ_ONLY_REASON
                          : undefined;

                    const previewDisabledReason = !savedRow?.eventName
                      ? "No Meta event is mapped to this trigger yet, so there is no payload to preview. Map an event and save first."
                      : undefined;

                    const triggerName = meta?.label ?? row.key;

                    return (
                      <TableRow key={row.key} className="align-top">
                        <TableCell className="py-2 whitespace-normal">
                          <p className="text-sm font-medium">{triggerName}</p>
                          <p className="text-muted-foreground text-xs">
                            {meta?.description ??
                              "Not in the label registry, but the storefront still knows this key."}
                          </p>
                        </TableCell>

                        <TableCell className="py-2 whitespace-normal">
                          <ControlWithReason
                            reason={readOnly ? READ_ONLY_REASON : undefined}
                          >
                            <Select
                              value={
                                row.isCustomEvent
                                  ? CUSTOM_OPTION
                                  : row.eventName || undefined
                              }
                              disabled={readOnly}
                              onValueChange={(value) =>
                                patchRow(
                                  row.key,
                                  value === CUSTOM_OPTION
                                    ? {
                                        isCustomEvent: true,
                                        eventName: row.isCustomEvent
                                          ? row.eventName
                                          : "",
                                      }
                                    : {
                                        isCustomEvent: false,
                                        eventName: value,
                                      },
                                )
                              }
                            >
                              <SelectTrigger
                                id={
                                  row.isCustomEvent
                                    ? undefined
                                    : eventNameFieldId(row.key)
                                }
                                aria-label={`Meta event for ${triggerName}`}
                                aria-invalid={Boolean(error)}
                                className={cn(
                                  "w-full min-w-48",
                                  error && "border-destructive",
                                )}
                              >
                                <SelectValue placeholder="Not mapped" />
                              </SelectTrigger>
                              <SelectContent>
                                {META_STANDARD_EVENTS.map((event) => (
                                  <SelectItem key={event} value={event}>
                                    {event}
                                  </SelectItem>
                                ))}
                                <SelectItem value={CUSTOM_OPTION}>
                                  Custom…
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </ControlWithReason>

                          {row.isCustomEvent && (
                            <Input
                              id={eventNameFieldId(row.key)}
                              value={row.eventName}
                              disabled={readOnly}
                              aria-label={`Custom event name for ${triggerName}`}
                              aria-invalid={Boolean(error)}
                              placeholder="PcBuildSaved"
                              className={cn(
                                "mt-1.5 h-8 font-mono text-xs",
                                error && "border-destructive",
                              )}
                              onChange={(e) =>
                                patchRow(row.key, {
                                  eventName: e.target.value,
                                })
                              }
                            />
                          )}

                          {error && (
                            <p
                              role="alert"
                              className="text-destructive mt-1.5 text-xs"
                            >
                              {error}
                            </p>
                          )}
                        </TableCell>

                        <TableCell className="py-2 text-center">
                          <ControlWithReason
                            reason={readOnly ? READ_ONLY_REASON : undefined}
                          >
                            <Switch
                              checked={row.enabled}
                              disabled={readOnly}
                              aria-label={`Enable ${triggerName}`}
                              onCheckedChange={(checked) =>
                                patchRow(row.key, { enabled: checked })
                              }
                            />
                          </ControlWithReason>
                        </TableCell>

                        <TableCell className="py-2 text-center">
                          <ControlWithReason
                            reason={readOnly ? READ_ONLY_REASON : undefined}
                          >
                            <Switch
                              checked={row.sendViaBrowser}
                              disabled={readOnly}
                              aria-label={`Send ${triggerName} from the browser`}
                              onCheckedChange={(checked) =>
                                patchRow(row.key, { sendViaBrowser: checked })
                              }
                            />
                          </ControlWithReason>
                        </TableCell>

                        <TableCell className="py-2 text-center">
                          <ControlWithReason reason={capiDisabledReason}>
                            <Switch
                              checked={row.sendViaCapi}
                              disabled={Boolean(capiDisabledReason)}
                              aria-label={`Send ${triggerName} through the Conversions API`}
                              onCheckedChange={(checked) =>
                                patchRow(row.key, { sendViaCapi: checked })
                              }
                            />
                          </ControlWithReason>
                        </TableCell>

                        <TableCell className="py-2 text-right">
                          <ControlWithReason reason={previewDisabledReason}>
                            <Button
                              type="button"
                              variant="view_button"
                              disabled={Boolean(previewDisabledReason)}
                              tooltip={
                                previewDisabledReason
                                  ? undefined
                                  : "Preview the payload Meta would receive"
                              }
                              aria-label={`Preview the payload for ${triggerName}`}
                              onClick={() => setPreviewKey(row.key)}
                            />
                          </ControlWithReason>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <p className="text-muted-foreground mt-2 text-xs">
              Preview builds the payload from the last saved mapping, so save
              your changes before previewing them.
            </p>
          </>
        )}

        {!readOnly && rows.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <Button
              type="button"
              loading={isSaving}
              disabled={!isDirty}
              onClick={handleSave}
            >
              Save events
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!isDirty || isSaving}
              onClick={() => {
                setRows(orderTriggers(config.triggers ?? []));
                setErrors({});
              }}
            >
              Discard changes
            </Button>
          </div>
        )}
      </SectionCard>

      <PayloadPreviewModal
        open={previewKey !== null}
        onOpenChange={(open) => !open && setPreviewKey(null)}
        triggerKey={previewKey ?? undefined}
        subject={
          previewTrigger
            ? `${TRIGGER_LABELS[previewTrigger.key]?.label ?? previewTrigger.key} → ${previewTrigger.eventName}`
            : undefined
        }
      />
    </div>
  );
};

export default MetaPixelEventsTab;
