"use client";

import PageHeader from "@/components/common/PageHeader";
import MetaPixelEventsTab from "@/components/marketing/MetaPixelEventsTab";
import MetaPixelHygieneTab from "@/components/marketing/MetaPixelHygieneTab";
import MetaPixelSetupTab from "@/components/marketing/MetaPixelSetupTab";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TMetaPixelConfig } from "@/interface/metaPixel.interface";
import { useCan } from "@/lib/permissions";
import { cn, globalError } from "@/lib/utils";
import { useGetMetaPixelConfigQuery } from "@/redux/api/metaPixelApi";
import { Check, Minus, ScrollText } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

type TSetupStep = {
  label: string;
  done: boolean;
  hint: string;
};

const buildSetupSteps = (config?: TMetaPixelConfig): TSetupStep[] => [
  {
    label: "Pixel configured",
    done: Boolean(config?.pixelId),
    hint: config?.pixelId
      ? `Pixel ID ${config.pixelId} is saved.`
      : "Add your Pixel ID on the Setup tab. Nothing is sent to Meta until this is set.",
  },
  {
    label: "CAPI verified",
    done: Boolean(config?.capiEnabled),
    hint: config?.capiEnabled
      ? "The access token has been verified against Meta, so server-side events can be sent."
      : "Save an access token, then run Test connection on the Setup tab. Server-side events and order status rules stay off until this succeeds.",
  },
  {
    label: "Tracking live",
    done: Boolean(config?.enabled),
    hint: config?.enabled
      ? "Events are being sent for storefront visitors."
      : "The master switch is off, so no events are sent from anywhere. Turn it on from the Hygiene tab.",
  },
];

const SetupStatusStrip = ({
  config,
  isLoading,
}: {
  config?: TMetaPixelConfig;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2 pb-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-8 w-40 rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap gap-2 pb-4">
        {buildSetupSteps(config).map((step) => (
          <Tooltip key={step.label}>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "flex cursor-help items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  step.done
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-muted text-muted-foreground",
                )}
              >
                {step.done ? <Check size={14} /> : <Minus size={14} />}
                {step.label}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{step.hint}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

const TabPlaceholder = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) => (
  <div className="bg-card rounded-lg border p-4">
    <h5 className="text-sm font-semibold">{title}</h5>
    <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
      {description}
    </p>
    {children}
  </div>
);

const MetaPixelPage = () => {
  const can = useCan();
  const { data, isLoading, error } = useGetMetaPixelConfigQuery(undefined);

  if (!isLoading && error) globalError(error);

  const config = data?.data;

  return (
    <div>
      <PageHeader
        title="Meta Pixel"
        subtitle="Configure the Meta Pixel and Conversions API for the storefront"
        buttons={
          can("can_read_meta_pixel_logs") ? (
            <Button variant="outline" asChild>
              <Link href="/marketing/meta-pixel/logs">
                <ScrollText size={16} />
                Event log
              </Link>
            </Button>
          ) : null
        }
      />

      <SetupStatusStrip config={config} isLoading={isLoading} />

      <Tabs defaultValue="setup" className="gap-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 p-1 sm:w-fit">
          <TabsTrigger className="px-3 py-1.5" value="setup">
            Setup
          </TabsTrigger>
          <TabsTrigger className="px-3 py-1.5" value="events">
            Events
          </TabsTrigger>
          <TabsTrigger className="px-3 py-1.5" value="rules">
            Order status rules
          </TabsTrigger>
          <TabsTrigger className="px-3 py-1.5" value="hygiene">
            Hygiene
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          {isLoading ? (
            <Skeleton className="h-72 w-full rounded-lg" />
          ) : (
            config && <MetaPixelSetupTab config={config} />
          )}
        </TabsContent>
        <TabsContent value="events">
          {isLoading ? (
            <Skeleton className="h-[32rem] w-full rounded-lg" />
          ) : (
            config && <MetaPixelEventsTab config={config} />
          )}
        </TabsContent>
        <TabsContent value="rules">
          <TabPlaceholder
            title="Order status rules"
            description="Rules that send a server-side event when an order reaches a chosen status — this is where the Purchase event is sent from."
          />
        </TabsContent>
        <TabsContent value="hygiene">
          {isLoading ? (
            <Skeleton className="h-72 w-full rounded-lg" />
          ) : (
            config && <MetaPixelHygieneTab config={config} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetaPixelPage;
