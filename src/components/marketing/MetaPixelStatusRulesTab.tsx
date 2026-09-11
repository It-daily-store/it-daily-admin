"use client";

import GlobalTable, {
  TCustomColumnDef,
} from "@/components/common/GlobalTable/GlobalTable";
import DeleteModal from "@/components/global/DeleteModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TMetaPixelConfig,
  TMetaPixelStatusRule,
} from "@/interface/metaPixel.interface";
import { useCan } from "@/lib/permissions";
import { globalError } from "@/lib/utils";
import { useUpdateMetaPixelConfigMutation } from "@/redux/api/metaPixelApi";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  ControlWithReason,
  ReadOnlyNotice,
  SectionCard,
} from "./MetaPixelSetupTab";
import MetaPixelStatusRuleModal, {
  TStatusRuleDraft,
} from "./MetaPixelStatusRuleModal";
import PayloadPreviewModal from "./PayloadPreviewModal";

type TProps = {
  config: TMetaPixelConfig;
  onGoToSetup?: () => void;
};

// The backend replaces the whole array, so every rule is sent back; keeping
// _id on the untouched ones is what stops their ids from being regenerated.
const toPayload = (rule: TMetaPixelStatusRule) => ({
  ...(rule._id ? { _id: rule._id } : {}),
  status: rule.status,
  eventName: rule.eventName.trim(),
  isCustomEvent: rule.isCustomEvent,
  enabled: rule.enabled,
});

const MetaPixelStatusRulesTab = ({ config, onGoToSetup }: TProps) => {
  const can = useCan();
  const readOnly = !can("can_update_marketing");

  const [updateConfig, { isLoading: isSaving }] =
    useUpdateMetaPixelConfigMutation();

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [previewRuleId, setPreviewRuleId] = useState<string | null>(null);

  const rules: TMetaPixelStatusRule[] = config.statusRules ?? [];

  const persist = async (next: TMetaPixelStatusRule[]) => {
    try {
      const res = await updateConfig({
        statusRules: next.map(toPayload),
      }).unwrap();
      toast.success(res.message);
      return true;
    } catch (err) {
      globalError(err);
      return false;
    }
  };

  const handleAdd = (draft: TStatusRuleDraft) => persist([...rules, draft]);

  const handleEdit = (index: number) => (draft: TStatusRuleDraft) =>
    persist(
      rules.map((rule, i) => (i === index ? { ...rule, ...draft } : rule)),
    );

  const handleDelete = async () => {
    if (deleteIndex === null) return;
    const ok = await persist(rules.filter((_, i) => i !== deleteIndex));
    if (ok) setDeleteIndex(null);
  };

  if (!config.capiEnabled) {
    return (
      <div className="flex flex-col gap-4">
        {readOnly && <ReadOnlyNotice />}

        <SectionCard
          title="Order status rules"
          description="Rules that send a server-side event when an order reaches a chosen status — this is where the Purchase event is sent from."
        >
          <div className="rounded-md border border-dashed px-3 py-6">
            <p className="text-muted-foreground max-w-2xl text-sm">
              Order status events are sent from the server through the
              Conversions API. Finish the Setup tab and run Test connection to
              enable them.
            </p>
            {onGoToSetup && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={onGoToSetup}
              >
                Go to Setup
              </Button>
            )}
          </div>
        </SectionCard>
      </div>
    );
  }

  const defaultColumns: TCustomColumnDef<TMetaPixelStatusRule>[] = [
    {
      accessorKey: "serial",
      header: "Serial",
      cell: ({ row }) => <p>{row.index + 1}</p>,
      id: "serial",
      maxSize: 60,
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "status",
      header: "Order status",
      cell: ({ row }) => (
        <p className="font-medium capitalize">{row.original.status}</p>
      ),
      id: "status",
      minSize: 140,
      maxSize: 200,
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "eventName",
      header: "Meta event",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs">{row.original.eventName}</span>
          {row.original.isCustomEvent && (
            <Badge variant="outline" className="text-muted-foreground">
              Custom
            </Badge>
          )}
        </div>
      ),
      id: "eventName",
      minSize: 180,
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "enabled",
      header: "Status",
      cell: ({ row }) =>
        row.original.enabled ? (
          <Badge>Enabled</Badge>
        ) : (
          <Badge variant="secondary" className="text-muted-foreground">
            Disabled
          </Badge>
        ),
      id: "enabled",
      minSize: 120,
      maxSize: 160,
      visible: true,
      canHide: true,
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const rule = row.original;
        const previewDisabledReason = !rule._id
          ? "This rule has not been saved yet, so there is no payload to preview. Reload the page and try again."
          : undefined;

        return (
          <div className="flex items-center gap-3">
            <ControlWithReason reason={previewDisabledReason}>
              <Button
                variant="view_button"
                size="base"
                disabled={Boolean(previewDisabledReason)}
                tooltip={
                  previewDisabledReason
                    ? undefined
                    : "Preview the payload Meta would receive"
                }
                aria-label={`Preview the payload for ${rule.status} → ${rule.eventName}`}
                onClick={() => setPreviewRuleId(rule._id ?? null)}
              />
            </ControlWithReason>
            {!readOnly && (
              <>
                <Button
                  variant="edit_button"
                  size="base"
                  tooltip="Edit this rule"
                  aria-label={`Edit the ${rule.status} → ${rule.eventName} rule`}
                  onClick={() => setEditIndex(row.index)}
                />
                <Button
                  variant="delete_button"
                  size="base"
                  tooltip="Delete this rule"
                  aria-label={`Delete the ${rule.status} → ${rule.eventName} rule`}
                  onClick={() => setDeleteIndex(row.index)}
                />
              </>
            )}
          </div>
        );
      },
      id: "actions",
      minSize: 140,
      maxSize: 180,
      visible: true,
      canHide: false,
    },
  ];

  const enabledCount = rules.filter((rule) => rule.enabled).length;
  const editRule = editIndex === null ? null : rules[editIndex];
  const deleteRule = deleteIndex === null ? null : rules[deleteIndex];

  return (
    <div className="flex flex-col gap-4">
      {readOnly && <ReadOnlyNotice />}

      <SectionCard
        title="Order status rules"
        description={`When an order reaches a status listed here, the matching event is sent to Meta from the server. ${enabledCount} of ${rules.length} rules are enabled.`}
      >
        {!readOnly && (
          <div className="mb-3 flex">
            <Button type="button" onClick={() => setAddOpen(true)}>
              <Plus size={16} />
              Add rule
            </Button>
          </div>
        )}

        {rules.length === 0 ? (
          <p className="text-muted-foreground rounded-md border border-dashed px-3 py-6 text-sm">
            No order status rules exist, so no purchases are reported to Meta
            from the server.
            {readOnly
              ? " Ask an administrator with the “Update marketing” permission to add one."
              : " Add a rule — delivered → Purchase is the usual starting point."}
          </p>
        ) : (
          <>
            <GlobalTable
              tableName="metaPixelStatusRules"
              defaultColumns={defaultColumns}
              data={rules}
              isLoading={false}
              limit={rules.length}
            />
            <p className="text-muted-foreground mt-2 text-xs">
              Preview builds the payload from the last saved rule and a recent
              order, so save your changes before previewing them.
            </p>
          </>
        )}
      </SectionCard>

      <MetaPixelStatusRuleModal
        open={addOpen}
        onOpenChange={setAddOpen}
        otherRules={rules}
        isSaving={isSaving}
        onSave={handleAdd}
      />

      {editRule && (
        <MetaPixelStatusRuleModal
          open={editIndex !== null}
          onOpenChange={(open) => !open && setEditIndex(null)}
          rule={editRule}
          otherRules={rules.filter((_, i) => i !== editIndex)}
          isSaving={isSaving}
          onSave={handleEdit(editIndex as number)}
        />
      )}

      <DeleteModal
        open={deleteIndex !== null}
        onOpenChange={(open) => !open && setDeleteIndex(null)}
        onConfirm={handleDelete}
        isLoading={isSaving}
        title="Delete this rule"
      >
        <p className="text-dark-gray text-sm">
          This rule will stop firing immediately. Events already sent to Meta
          are not affected.
          {deleteRule
            ? ` Orders becoming ${deleteRule.status} will no longer send ${deleteRule.eventName}.`
            : ""}
        </p>
      </DeleteModal>

      <PayloadPreviewModal
        open={previewRuleId !== null}
        onOpenChange={(open) => !open && setPreviewRuleId(null)}
        statusRuleId={previewRuleId ?? undefined}
        subject={(() => {
          const rule = rules.find((r) => r._id === previewRuleId);
          return rule ? `${rule.status} → ${rule.eventName}` : undefined;
        })()}
      />
    </div>
  );
};

export default MetaPixelStatusRulesTab;
