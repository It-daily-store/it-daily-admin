"use client";

import DeleteModal from "@/components/global/DeleteModal";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TMetaPixelConfig,
  TTestConnectionResult,
} from "@/interface/metaPixel.interface";
import { useCan } from "@/lib/permissions";
import { cn, globalError } from "@/lib/utils";
import {
  useTestMetaPixelConnectionMutation,
  useUpdateMetaPixelConfigMutation,
} from "@/redux/api/metaPixelApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Lock, PlugZap, XCircle } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const READ_ONLY_REASON =
  "You have read-only access to marketing settings. Ask an administrator for the “Update marketing” permission to change this.";

export const SectionCard = ({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description: string;
  className?: string;
  children: ReactNode;
}) => (
  <section className={cn("bg-card rounded-lg border p-4", className)}>
    <h5 className="text-sm font-semibold">{title}</h5>
    <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
      {description}
    </p>
    <div className="mt-4">{children}</div>
  </section>
);

// A disabled control swallows pointer events, so the tooltip has to sit on a wrapper.
export const ControlWithReason = ({
  reason,
  children,
}: {
  reason?: string;
  children: ReactNode;
}) => {
  if (!reason) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-help items-center">{children}</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{reason}</TooltipContent>
    </Tooltip>
  );
};

export const ReadOnlyNotice = () => (
  <p className="text-muted-foreground bg-muted/40 rounded-md border border-dashed px-3 py-2 text-sm">
    {READ_ONLY_REASON}
  </p>
);

const setupSchema = z.object({
  pixelId: z
    .string()
    .trim()
    .max(50, "A dataset ID is at most 50 characters. Check for a stray paste.")
    .regex(
      /^\d*$/,
      "A dataset ID is all digits. Copy the ID from Events Manager → Data sources, not the dataset's name.",
    ),
  accessToken: z.string().trim(),
  testEventCode: z
    .string()
    .trim()
    .max(
      50,
      "A test event code is at most 50 characters. Copy it from Events Manager → Test events.",
    ),
  currency: z
    .string()
    .trim()
    .length(
      3,
      "Use the three-letter ISO code of your store currency, for example BDT.",
    ),
  contentIdSource: z.enum(["sku", "_id", "slug"]),
  capiEnabled: z.boolean(),
  userDataParams: z.record(z.string(), z.boolean()),
});

// Mirrors the customer information parameters in Events Manager → dataset →
// Settings. fbp, fbc, IP and user agent are absent from that screen because Meta
// always takes them for web events.
const USER_DATA_PARAMS: {
  key: string;
  label: string;
  unavailable?: string;
}[] = [
  { key: "em", label: "Email" },
  { key: "ph", label: "Phone number" },
  { key: "fn", label: "First name" },
  { key: "ln", label: "Last name" },
  {
    key: "ge",
    label: "Gender",
    unavailable:
      "Your store never asks customers for their gender, so there is nothing to share. This becomes available if gender is added to customer accounts.",
  },
  {
    key: "db",
    label: "Date of birth",
    unavailable:
      "Your store never asks customers for their date of birth, so there is nothing to share. This becomes available if it is added to customer accounts.",
  },
  { key: "ct", label: "City" },
  { key: "st", label: "State" },
  {
    key: "zp",
    label: "Zip code",
    unavailable:
      "Checkout asks for an address, city and district, but not a postal code, so there is nothing to share.",
  },
  { key: "country", label: "Country" },
  { key: "external_id", label: "External ID" },
];

type TSetupValues = z.infer<typeof setupSchema>;

const toFormValues = (config: TMetaPixelConfig): TSetupValues => ({
  pixelId: config.pixelId ?? "",
  accessToken: "",
  testEventCode: config.testEventCode ?? "",
  currency: config.currency ?? "BDT",
  contentIdSource: config.contentIdSource ?? "sku",
  capiEnabled: config.capiEnabled,
  // An unset parameter is sent, so only an explicit false turns a switch off.
  userDataParams: Object.fromEntries(
    USER_DATA_PARAMS.map(({ key }) => [
      key,
      config.userDataParams?.[key] !== false,
    ]),
  ),
});

const CONTENT_ID_SOURCES: {
  value: TSetupValues["contentIdSource"];
  label: string;
}[] = [
  { value: "sku", label: "Product SKU" },
  { value: "_id", label: "Internal product ID" },
  { value: "slug", label: "Product web address" },
];

const TestResultPanel = ({ result }: { result: TTestConnectionResult }) => {
  const eventsReceived = result.response?.events_received;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "mt-4 rounded-md border p-3 text-sm",
        result.ok
          ? "border-primary/40 bg-primary/5"
          : "border-destructive/40 bg-destructive/5",
      )}
    >
      <p
        className={cn(
          "flex items-center gap-2 font-medium",
          result.ok ? "text-primary" : "text-destructive",
        )}
      >
        {result.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
        {result.ok
          ? "Meta accepted the test event"
          : "Meta rejected the test event"}
      </p>

      {result.ok ? (
        <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
          <dt className="text-muted-foreground">Events received</dt>
          <dd className="font-mono">{String(eventsReceived ?? 0)}</dd>
          <dt className="text-muted-foreground">Trace ID</dt>
          <dd className="font-mono break-all">{result.fbtraceId ?? "—"}</dd>
          <dt className="text-muted-foreground">Test event code</dt>
          <dd className="font-mono">{result.testEventCode ?? "not set"}</dd>
        </dl>
      ) : (
        <>
          <p className="text-muted-foreground mt-2 text-xs">
            What Meta sent back
            {result.httpStatus ? ` (HTTP ${result.httpStatus})` : ""}:
          </p>
          <pre className="bg-muted mt-1 max-h-40 overflow-auto rounded p-2 font-mono text-xs whitespace-pre-wrap">
            {result.errorMessage || "Meta returned no error message."}
          </pre>
          {result.fbtraceId && (
            <p className="text-muted-foreground mt-2 text-xs">
              Trace ID <span className="font-mono">{result.fbtraceId}</span> —
              quote this if you contact Meta support.
            </p>
          )}
          <p className="text-muted-foreground mt-2 text-sm">
            Fix the dataset ID or paste a fresh access token above, save, then
            run the test again.
          </p>
        </>
      )}
    </div>
  );
};

const MetaPixelSetupTab = ({ config }: { config: TMetaPixelConfig }) => {
  const can = useCan();
  const readOnly = !can("can_update_marketing");

  const [updateConfig, { isLoading: isSaving }] =
    useUpdateMetaPixelConfigMutation();
  const [testConnection, { isLoading: isTesting }] =
    useTestMetaPixelConnectionMutation();

  const [testResult, setTestResult] = useState<TTestConnectionResult | null>(
    null,
  );
  const [removeTokenOpen, setRemoveTokenOpen] = useState(false);

  const form = useForm<TSetupValues>({
    resolver: zodResolver(setupSchema),
    mode: "onBlur",
    defaultValues: toFormValues(config),
  });

  useEffect(() => {
    form.reset(toFormValues(config));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.updatedAt]);

  const onSubmit = async (values: TSetupValues) => {
    try {
      const payload: Record<string, unknown> = {
        ...values,
        currency: values.currency.toUpperCase(),
      };

      // An empty field means "leave the stored token alone", not "clear it".
      if (!values.accessToken) delete payload.accessToken;

      const res = await updateConfig(payload).unwrap();
      toast.success(res.message);
    } catch (err) {
      globalError(err);
    }
  };

  const handleRemoveToken = async () => {
    try {
      const res = await updateConfig({ accessToken: "" }).unwrap();
      toast.success(res.message);
      setTestResult(null);
      setRemoveTokenOpen(false);
    } catch (err) {
      globalError(err);
    }
  };

  const handleTestConnection = async () => {
    try {
      const res = await testConnection().unwrap();
      setTestResult(res.data);
      if (res.data.ok) toast.success(res.message);
    } catch (err) {
      globalError(err);
    }
  };

  const testDisabledReason = readOnly
    ? READ_ONLY_REASON
    : !config.pixelId || !config.hasToken
      ? "Add a dataset ID and an access token, then save. The test contacts Meta using the details you have saved."
      : undefined;

  const capiDisabledReason = readOnly
    ? READ_ONLY_REASON
    : !config.tokenVerifiedAt
      ? "Run Test connection first. This stays off until Meta confirms your access token works."
      : undefined;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        {readOnly && <ReadOnlyNotice />}

        <SectionCard
          title="Meta connection"
          description="Connects this store to your Meta ad account. Both values come from Events Manager. Until they are saved, Meta receives nothing and your ads cannot be optimised for sales."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="pixelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dataset ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      inputMode="numeric"
                      disabled={readOnly}
                      placeholder="1234567890123456"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Find it in Events Manager under Data sources. Meta used to
                    call this the Pixel ID — it is the same number. Until it is
                    filled in, nothing about your store reaches Meta.
                  </FormDescription>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accessToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access token</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      autoComplete="off"
                      disabled={readOnly}
                      placeholder={
                        config.hasToken
                          ? `••••••${config.tokenLast4 ?? ""}`
                          : "Paste the system user access token"
                      }
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Saved securely and never shown again. Leave this blank to
                    keep the token you already saved.
                  </FormDescription>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="testEventCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test event code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={readOnly}
                      placeholder="TEST12345"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Use this only while testing. Activity sent with a code shows
                    up under Test events in Events Manager and is kept out of
                    your real ad results. Clear it when you are done.
                  </FormDescription>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />
          </div>

          {config.hasToken && (
            <div className="bg-muted/40 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed px-3 py-2">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Lock size={14} className="text-muted-foreground" />
                  Saved token
                  <span className="font-mono">
                    ••••••{config.tokenLast4 ?? ""}
                  </span>
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {config.tokenVerifiedAt
                    ? `Verified against Meta on ${new Date(config.tokenVerifiedAt).toLocaleString()}.`
                    : "Not verified yet — run Test connection below."}
                </p>
              </div>
              <ControlWithReason
                reason={readOnly ? READ_ONLY_REASON : undefined}
              >
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={readOnly}
                  onClick={() => setRemoveTokenOpen(true)}
                >
                  Remove token
                </Button>
              </ControlWithReason>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Conversions API"
          description="Reports sales and other activity to Meta directly from this store, so conversions still reach your campaigns when a customer's browser blocks tracking. Test the connection before switching it on — an unverified token fails quietly."
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Report activity to Meta</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {config.tokenVerifiedAt
                  ? "Your access token is verified. Order status rules can now report sales to Meta."
                  : "Unavailable until a test connection succeeds."}
              </p>
            </div>
            <FormField
              control={form.control}
              name="capiEnabled"
              render={({ field }) => (
                <FormItem className="gap-0">
                  <FormControl>
                    <div>
                      <ControlWithReason reason={capiDisabledReason}>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={Boolean(capiDisabledReason)}
                          aria-label="Report activity to Meta"
                        />
                      </ControlWithReason>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <p className="text-muted-foreground mt-3 text-xs">
            Keep Meta&apos;s own one-click Conversions API turned off in Events
            Manager. If both are running, Meta cannot tell the two apart and
            counts every sale twice, which inflates your reported results and
            misleads campaign optimisation.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ControlWithReason reason={testDisabledReason}>
              <Button
                type="button"
                loading={isTesting}
                disabled={Boolean(testDisabledReason)}
                onClick={handleTestConnection}
              >
                <PlugZap size={16} />
                Test connection
              </Button>
            </ControlWithReason>
            {form.formState.isDirty && (
              <p className="text-muted-foreground text-xs">
                The test uses the saved credentials — save your changes first.
              </p>
            )}
          </div>

          {testResult && <TestResultPanel result={testResult} />}
        </SectionCard>

        <SectionCard
          title="Product and value reporting"
          description="How your products and order values are described to Meta. These apply to everything reported from your store."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={readOnly}
                      maxLength={3}
                      className="uppercase"
                      placeholder="BDT"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    The ISO code reported with every value, for example BDT.
                  </FormDescription>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contentIdSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product ID source</FormLabel>
                  <ControlWithReason
                    reason={readOnly ? READ_ONLY_REASON : undefined}
                  >
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={readOnly}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONTENT_ID_SOURCES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </ControlWithReason>
                  <FormDescription className="text-xs">
                    This must match the item IDs in your Meta product catalog
                    feed, or dynamic and retargeting ads will not match.
                  </FormDescription>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Customer information parameters"
          description="Which customer details are shared with Meta so it can match a sale to the person who saw your ad. The more you share, the more sales Meta can attribute to your campaigns. Every detail is scrambled beyond recovery before it leaves this store — Meta never receives a readable email or phone number. Turn on the same ones you selected in Events Manager."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {USER_DATA_PARAMS.map(({ key, label, unavailable }) => (
              <FormField
                key={key}
                control={form.control}
                name={`userDataParams.${key}`}
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                    <div className="flex items-center gap-2">
                      <FormLabel
                        className={cn(
                          "text-sm font-normal",
                          unavailable && "text-muted-foreground",
                        )}
                      >
                        {label}
                      </FormLabel>
                      <span className="text-muted-foreground font-mono text-xs">
                        {key}
                      </span>
                    </div>
                    <FormControl>
                      <div>
                        <ControlWithReason
                          reason={
                            unavailable ??
                            (readOnly ? READ_ONLY_REASON : undefined)
                          }
                        >
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={readOnly || Boolean(unavailable)}
                            aria-label={`Send ${label}`}
                          />
                        </ControlWithReason>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </SectionCard>

        {!readOnly && (
          <div className="flex items-center gap-3">
            <Button type="submit" loading={isSaving}>
              Save setup
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving || !form.formState.isDirty}
              onClick={() => form.reset(toFormValues(config))}
            >
              Discard changes
            </Button>
          </div>
        )}
      </form>

      <DeleteModal
        open={removeTokenOpen}
        onOpenChange={setRemoveTokenOpen}
        onConfirm={handleRemoveToken}
        isLoading={isSaving}
        title="Remove access token"
        confirmText="Yes, remove it"
      >
        <p className="text-dark-gray text-sm">
          Server-side sending stops immediately and the Conversions API has to
          be verified again once you paste a new token. Browser pixel events are
          not affected.
        </p>
      </DeleteModal>
    </Form>
  );
};

export default MetaPixelSetupTab;
