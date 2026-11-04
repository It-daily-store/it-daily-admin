"use client";

import PageHeader from "@/components/common/PageHeader";
import MetaPixelEventsTab from "@/components/marketing/MetaPixelEventsTab";
import MetaPixelHygieneTab from "@/components/marketing/MetaPixelHygieneTab";
import MetaPixelSetupTab from "@/components/marketing/MetaPixelSetupTab";
import MetaPixelStatusRulesTab from "@/components/marketing/MetaPixelStatusRulesTab";
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
import { useState } from "react";

type TSetupStep = {
  label: string;
  done: boolean;
  hint: string;
};

const buildSetupSteps = (config?: TMetaPixelConfig): TSetupStep[] => [
  {
    label: "Account connected",
    done: Boolean(config?.pixelId),
    hint: config?.pixelId
      ? `Dataset ID ${config.pixelId} is saved.`
      : "Add your dataset ID on the Setup tab. Until then, nothing about your store reaches Meta.",
  },
  {
    label: "Access token verified",
    done: Boolean(config?.capiEnabled),
    hint: config?.capiEnabled
      ? "Meta has accepted your access token, so this store can report sales directly."
      : "Save an access token, then run Test connection on the Setup tab. Order status rules stay off until this succeeds.",
  },
  {
    label: "Tracking live",
    done: Boolean(config?.enabled),
    hint: config?.enabled
      ? "Customer activity is being reported to Meta."
      : "The master switch is off, so nothing at all is reported to Meta. Turn it on from the Hygiene tab.",
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

const MetaPixelPage = () => {
  const can = useCan();
  const [tab, setTab] = useState("setup");
  const { data, isLoading, error } = useGetMetaPixelConfigQuery(undefined);

  if (!isLoading && error) globalError(error);

  const config = data?.data;

  return (
    <div>
      <PageHeader
        title="Meta Pixel"
        subtitle="Control what your store reports to Meta for ad tracking and conversions"
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

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
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
          {isLoading ? (
            <Skeleton className="h-72 w-full rounded-lg" />
          ) : (
            config && (
              <MetaPixelStatusRulesTab
                config={config}
                onGoToSetup={() => setTab("setup")}
              />
            )
          )}
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
