"use client";

import Modal from "@/components/custom/Modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  META_STANDARD_EVENTS,
  ORDER_STATUSES,
  TMetaPixelStatusRule,
} from "@/interface/metaPixel.interface";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const CUSTOM_OPTION = "__custom__";

const EVENT_NAME_PATTERN = /^[A-Za-z0-9_ ]+$/;

// Meta attributes a click for 7 days, so a Purchase sent after these two
// statuses usually lands outside the window.
const IN_WINDOW_STATUSES = ["confirmed", "processing"];

const ruleSchema = z
  .object({
    status: z
      .string()
      .min(1, "Pick the order status that should send this event."),
    eventOption: z
      .string()
      .min(
        1,
        "Pick a Meta event, or choose Custom and type your own event name.",
      ),
    customEventName: z.string().trim(),
    enabled: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.eventOption !== CUSTOM_OPTION) return;

    if (!values.customEventName) {
      ctx.addIssue({
        code: "custom",
        path: ["customEventName"],
        message:
          "Type the custom event name, for example OrderDelivered, or pick a standard event instead.",
      });
      return;
    }

    if (!EVENT_NAME_PATTERN.test(values.customEventName)) {
      ctx.addIssue({
        code: "custom",
        path: ["customEventName"],
        message:
          "An event name may only contain letters, digits, underscores and spaces. Remove any other character.",
      });
    }
  });

type TRuleValues = z.infer<typeof ruleSchema>;

export type TStatusRuleDraft = {
  status: string;
  eventName: string;
  isCustomEvent: boolean;
  enabled: boolean;
};

type TProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: TMetaPixelStatusRule | null;
  otherRules: TMetaPixelStatusRule[];
  isSaving: boolean;
  onSave: (draft: TStatusRuleDraft) => Promise<boolean>;
};

const toFormValues = (rule?: TMetaPixelStatusRule | null): TRuleValues => ({
  status: rule?.status ?? "",
  eventOption: rule
    ? rule.isCustomEvent
      ? CUSTOM_OPTION
      : rule.eventName
    : "",
  customEventName: rule?.isCustomEvent ? rule.eventName : "",
  enabled: rule?.enabled ?? true,
});

const FIELD_IDS = {
  status: "meta-status-rule-status",
  eventOption: "meta-status-rule-event",
  customEventName: "meta-status-rule-custom-event",
} as const;

// A controlled Select has no registered ref, so focus goes through the DOM id.
const focusField = (field: keyof typeof FIELD_IDS) => {
  document.getElementById(FIELD_IDS[field])?.focus();
};

const resolveEventName = (values: TRuleValues): string =>
  values.eventOption === CUSTOM_OPTION
    ? values.customEventName.trim()
    : values.eventOption;

const MetaPixelStatusRuleModal = ({
  open,
  onOpenChange,
  rule,
  otherRules,
  isSaving,
  onSave,
}: TProps) => {
  const form = useForm<TRuleValues>({
    resolver: zodResolver(ruleSchema),
    mode: "onBlur",
    defaultValues: toFormValues(rule),
  });

  useEffect(() => {
    if (open) form.reset(toFormValues(rule));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rule?._id]);

  const values = form.watch();
  const eventName = resolveEventName(values);
  const isCustom = values.eventOption === CUSTOM_OPTION;

  const showAttributionWarning =
    eventName === "Purchase" &&
    Boolean(values.status) &&
    !IN_WINDOW_STATUSES.includes(values.status);

  const onSubmit = async (submitted: TRuleValues) => {
    const nextEventName = resolveEventName(submitted);

    const duplicate = otherRules.some(
      (other) =>
        other.status === submitted.status && other.eventName === nextEventName,
    );

    if (duplicate) {
      const field =
        submitted.eventOption === CUSTOM_OPTION
          ? "customEventName"
          : "eventOption";

      form.setError(field, {
        type: "manual",
        message: `A rule already sends ${nextEventName} when an order becomes ${submitted.status}. Change the status or the event, or edit the existing rule instead.`,
      });
      focusField(field);
      return;
    }

    const saved = await onSave({
      status: submitted.status,
      eventName: nextEventName,
      isCustomEvent: submitted.eventOption === CUSTOM_OPTION,
      enabled: submitted.enabled,
    });

    if (saved) onOpenChange(false);
  };

  const onInvalid = () => {
    const firstError = (
      ["status", "eventOption", "customEventName"] as const
    ).find((field) => form.getFieldState(field).error);
    if (firstError) focusField(firstError);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={rule ? "Edit order status rule" : "Add order status rule"}
      className="sm:max-w-lg"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="flex flex-col gap-4"
        >
          <p className="text-muted-foreground text-sm">
            When an order reaches the chosen status, this event is sent to Meta
            from the server through the Conversions API.
          </p>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order status *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger
                      id={FIELD_IDS.status}
                      className="w-full"
                      aria-label="Order status that sends this event"
                    >
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                        className="capitalize"
                      >
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  The event fires once, the first time an order moves into this
                  status.
                </FormDescription>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="eventOption"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta event *</FormLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger
                      id={FIELD_IDS.eventOption}
                      className="w-full"
                      aria-label="Meta event to send"
                    >
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {META_STANDARD_EVENTS.map((event) => (
                      <SelectItem key={event} value={event}>
                        {event}
                      </SelectItem>
                    ))}
                    <SelectItem value={CUSTOM_OPTION}>Custom…</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  Standard events feed Meta&apos;s optimisation. Use a custom
                  event when no standard one fits.
                </FormDescription>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          {isCustom && (
            <FormField
              control={form.control}
              name="customEventName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom event name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id={FIELD_IDS.customEventName}
                      className="font-mono"
                      placeholder="OrderDelivered"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Letters, digits, underscores and spaces only. The same name
                    appears in Events Manager.
                  </FormDescription>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />
          )}

          {showAttributionWarning && (
            <div
              role="note"
              className="border-warning/40 bg-warning/10 rounded-md border p-3"
            >
              <p className="text-warning flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle size={16} />
                This Purchase may fall outside the attribution window
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Meta credits a purchase to an ad only inside the attribution
                window — 7 days from the click by default. Orders delivered
                later than that will not be attributed to the campaign, so Ads
                Manager will under-report revenue. This is the accurate choice
                if you only count fulfilled orders; use a custom event such as{" "}
                <span className="font-mono">OrderDelivered</span> instead if you
                want Purchase to fire at checkout.
              </p>
            </div>
          )}

          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2">
                  <div>
                    <FormLabel>Rule enabled</FormLabel>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      A disabled rule is kept but sends nothing.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Rule enabled"
                    />
                  </FormControl>
                </div>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3">
            <Button type="submit" loading={isSaving}>
              {rule ? "Save rule" : "Add rule"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
};

export default MetaPixelStatusRuleModal;
