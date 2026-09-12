"use client";

import DeleteModal from "@/components/global/DeleteModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TMetaPixelConfig } from "@/interface/metaPixel.interface";
import { useCan } from "@/lib/permissions";
import { globalError } from "@/lib/utils";
import { useUpdateMetaPixelConfigMutation } from "@/redux/api/metaPixelApi";
import { Power, X } from "lucide-react";
import { KeyboardEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ControlWithReason,
  READ_ONLY_REASON,
  ReadOnlyNotice,
  SectionCard,
} from "./MetaPixelSetupTab";

const MAX_EXCLUDED_IPS = 50;

// Mirrors the backend's ipPatternSchema; the range checks only sharpen the message.
const IP_PATTERN = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;

const validateIp = (value: string, existing: string[]): string | null => {
  if (!IP_PATTERN.test(value)) {
    return "Use an IPv4 address or a CIDR range, for example 203.0.113.7 or 203.0.113.0/24.";
  }

  const [address, prefix] = value.split("/");

  if (address.split(".").some((part) => Number(part) > 255)) {
    return "Every part of an IPv4 address must be between 0 and 255. Correct the address and add it again.";
  }

  if (prefix !== undefined && Number(prefix) > 32) {
    return "A CIDR prefix must be between 0 and 32. Use /24 for a block of 256 addresses.";
  }

  if (existing.includes(value)) {
    return "That address is already excluded. Remove the existing entry if you meant to change it.";
  }

  if (existing.length >= MAX_EXCLUDED_IPS) {
    return `You can exclude at most ${MAX_EXCLUDED_IPS} addresses. Remove one before adding another.`;
  }

  return null;
};

const MetaPixelHygieneTab = ({ config }: { config: TMetaPixelConfig }) => {
  const can = useCan();
  const readOnly = !can("can_update_marketing");

  const [updateConfig, { isLoading: isSaving }] =
    useUpdateMetaPixelConfigMutation();

  const [ips, setIps] = useState<string[]>(config.excludedIps ?? []);
  const [draft, setDraft] = useState("");
  const [ipError, setIpError] = useState<string | null>(null);
  const [killSwitchOpen, setKillSwitchOpen] = useState(false);

  useEffect(() => {
    setIps(config.excludedIps ?? []);
    setDraft("");
    setIpError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.updatedAt]);

  const save = async (payload: Record<string, unknown>) => {
    try {
      const res = await updateConfig(payload).unwrap();
      toast.success(res.message);
      return true;
    } catch (err) {
      globalError(err);
      return false;
    }
  };

  const handleAddIp = () => {
    const value = draft.trim();
    if (!value) {
      setIpError("Enter an address first, for example 203.0.113.7.");
      return;
    }

    const error = validateIp(value, ips);
    setIpError(error);
    if (error) return;

    setIps([...ips, value]);
    setDraft("");
  };

  const handleDraftKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleAddIp();
  };

  const handleToggleTracking = async (next: boolean) => {
    if (!next) {
      setKillSwitchOpen(true);
      return;
    }
    await save({ enabled: true });
  };

  const handleConfirmDisable = async () => {
    const ok = await save({ enabled: false });
    if (ok) setKillSwitchOpen(false);
  };

  const ipsChanged =
    ips.length !== (config.excludedIps ?? []).length ||
    ips.some((ip, index) => ip !== config.excludedIps?.[index]);

  return (
    <div className="flex flex-col gap-4">
      {readOnly && <ReadOnlyNotice />}

      <SectionCard
        title="Excluded IP addresses"
        description="Traffic from these addresses fires no events at all — use it to keep your own office, warehouse or VPN out of your ad data."
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="meta-pixel-excluded-ip">Add an address</Label>
          <div className="flex flex-wrap items-start gap-2">
            <div className="min-w-56 flex-1">
              <Input
                id="meta-pixel-excluded-ip"
                value={draft}
                disabled={readOnly}
                aria-invalid={Boolean(ipError)}
                aria-describedby="meta-pixel-excluded-ip-help"
                placeholder="203.0.113.7"
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => {
                  const value = draft.trim();
                  setIpError(value ? validateIp(value, ips) : null);
                }}
                onKeyDown={handleDraftKeyDown}
              />
            </div>
            <ControlWithReason reason={readOnly ? READ_ONLY_REASON : undefined}>
              <Button type="button" disabled={readOnly} onClick={handleAddIp}>
                Add
              </Button>
            </ControlWithReason>
          </div>
          <p
            id="meta-pixel-excluded-ip-help"
            className="text-muted-foreground text-xs"
          >
            Accepted formats: a single IPv4 address (203.0.113.7) or a CIDR
            range (203.0.113.0/24). Up to {MAX_EXCLUDED_IPS} entries.
          </p>
          {ipError && (
            <p role="alert" className="text-destructive text-sm">
              {ipError}
            </p>
          )}
        </div>

        <div className="mt-4">
          {ips.length === 0 ? (
            <p className="text-muted-foreground rounded-md border border-dashed px-3 py-4 text-sm">
              No addresses are excluded, so every visitor is tracked. Add your
              office or VPN address above to keep internal traffic out of your
              ad reporting.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {ips.map((ip) => (
                <li
                  key={ip}
                  className="bg-muted flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-xs"
                >
                  {ip}
                  {!readOnly && (
                    <button
                      type="button"
                      aria-label={`Remove ${ip}`}
                      className="text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                      onClick={() => setIps(ips.filter((v) => v !== ip))}
                    >
                      <X size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {!readOnly && (
          <div className="mt-4 flex items-center gap-3">
            <Button
              type="button"
              loading={isSaving}
              disabled={!ipsChanged}
              onClick={() => save({ excludedIps: ips })}
            >
              Save excluded IPs
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!ipsChanged || isSaving}
              onClick={() => {
                setIps(config.excludedIps ?? []);
                setIpError(null);
              }}
            >
              Discard changes
            </Button>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Bot filtering"
        description="Requests whose user agent looks like a crawler are skipped, so bot traffic never inflates your event counts."
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2">
          <div>
            <p className="text-sm font-medium">Skip known bots and crawlers</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Leave this on unless you are deliberately testing with an
              automated browser.
            </p>
          </div>
          <ControlWithReason reason={readOnly ? READ_ONLY_REASON : undefined}>
            <Switch
              checked={config.blockBots}
              disabled={readOnly || isSaving}
              aria-label="Skip known bots and crawlers"
              onCheckedChange={(checked) => save({ blockBots: checked })}
            />
          </ControlWithReason>
        </div>
      </SectionCard>

      <Separator />

      <section className="border-destructive/40 bg-destructive/5 rounded-lg border p-4">
        <h5 className="text-destructive flex items-center gap-2 text-sm font-semibold">
          <Power size={14} />
          Tracking kill switch
        </h5>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          One switch stops every Meta Pixel and Conversions API event at once.
          Your event mapping and status rules are kept, so turning it back on
          resumes exactly where you left off.
        </p>

        <div className="bg-card mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2">
          <div>
            <p className="text-sm font-medium">
              {config.enabled ? "Tracking is live" : "Tracking is off"}
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {config.enabled
                ? "Events are being sent for storefront visitors."
                : "No events are sent from anywhere, whatever the Events and Rules tabs say."}
            </p>
          </div>
          <ControlWithReason reason={readOnly ? READ_ONLY_REASON : undefined}>
            <Switch
              checked={config.enabled}
              disabled={readOnly || isSaving}
              aria-label="Meta Pixel tracking master switch"
              onCheckedChange={handleToggleTracking}
            />
          </ControlWithReason>
        </div>
      </section>

      <DeleteModal
        open={killSwitchOpen}
        onOpenChange={setKillSwitchOpen}
        onConfirm={handleConfirmDisable}
        isLoading={isSaving}
        title="Turn tracking off"
        confirmText="Yes, turn it off"
      >
        <p className="text-dark-gray text-sm">
          All Meta Pixel and Conversions API events will stop immediately. Your
          event mapping and status rules are kept.
        </p>
      </DeleteModal>
    </div>
  );
};

export default MetaPixelHygieneTab;
