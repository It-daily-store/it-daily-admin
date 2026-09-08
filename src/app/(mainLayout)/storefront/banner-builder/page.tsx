"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

import {
  TBannerTemplateSummary,
  useDeleteTemplateMutation,
  useDuplicateTemplateMutation,
  useGetAllTemplatesQuery,
  useRenameTemplateMutation,
  useSetTemplateActiveMutation,
} from "@/redux/api/bannerApi";
import { globalError } from "@/lib/utils";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import GlobalTable, {
  TCustomColumnDef,
} from "@/components/common/GlobalTable/GlobalTable";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import DeleteModal from "@/components/global/DeleteModal";
import Modal from "@/components/custom/Modal";
import { Input } from "@/components/ui/input";
import CreateBannerTemplate from "@/components/banner/CreateBannerTemplate";
import { useCan } from "@/lib/permissions";

const BannerBuilderPage = () => {
  const router = useRouter();
  const can = useCan();

  const {
    data: templateData,
    isLoading,
    error,
  } = useGetAllTemplatesQuery(undefined);
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] =
    useState<TBannerTemplateSummary | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTemplate, { isLoading: isDeleting }] =
    useDeleteTemplateMutation();
  const [renameTemplate, { isLoading: isRenaming }] =
    useRenameTemplateMutation();
  const [duplicateTemplate] = useDuplicateTemplateMutation();
  const [setTemplateActive, { isLoading: isSettingActive }] =
    useSetTemplateActiveMutation();

  if (!isLoading && error) {
    globalError(error);
  }

  const handleDelete = async () => {
    if (!deleteOpen) return;
    try {
      const res = await deleteTemplate(deleteOpen).unwrap();
      toast.success(res.message);
      setDeleteOpen(null);
    } catch (err) {
      globalError(err);
    }
  };

  const handleRename = async () => {
    if (!renameTarget) return;
    try {
      const res = await renameTemplate({
        id: renameTarget._id,
        name: renameValue,
      }).unwrap();
      toast.success(res.message);
      setRenameTarget(null);
      setRenameValue("");
    } catch (err) {
      globalError(err);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await duplicateTemplate(id).unwrap();
      toast.success(res.message);
    } catch (err) {
      globalError(err);
    }
  };

  const handleToggleActive = async (template: TBannerTemplateSummary) => {
    try {
      const res = await setTemplateActive({
        id: template._id,
        is_active: !template.is_active,
      }).unwrap();
      toast.success(res.message);
    } catch (err) {
      globalError(err);
    }
  };

  const defaultColumns: TCustomColumnDef<TBannerTemplateSummary>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <p>{row.original.name}</p>,
      id: "name",
      minSize: 200,
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "is_active",
      header: "Active",
      // Every switch is disabled while any activation is in flight, not just
      // the row being toggled: activation is exclusive server-side, so two
      // overlapping toggles would race over the single active slot.
      cell: ({ row }) =>
        can("can_publish_banner") ? (
          <Switch
            checked={row.original.is_active}
            disabled={isSettingActive}
            onCheckedChange={() => handleToggleActive(row.original)}
            aria-label={`Show "${row.original.name}" on the storefront`}
          />
        ) : (
          <Badge variant={row.original.is_active ? "default" : "secondary"}>
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      id: "is_active",
      minSize: 110,
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "updatedAt",
      header: "Last updated",
      cell: ({ row }) => (
        <p>{dayjs(row.original.updatedAt).format("MMM D, YYYY h:mm A")}</p>
      ),
      id: "updatedAt",
      minSize: 180,
      visible: true,
      canHide: false,
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Button
            onClick={() =>
              router.push(`/storefront/banner-builder/${row.original._id}`)
            }
            variant={"edit_button"}
            size={"base"}
          ></Button>
          {can("can_update_banner") && (
            <Button
              variant={"outline"}
              size={"base"}
              onClick={() => {
                setRenameTarget(row.original);
                setRenameValue(row.original.name);
              }}
            >
              Rename
            </Button>
          )}
          {can("can_duplicate_banner") && (
            <Button
              variant={"outline"}
              size={"base"}
              onClick={() => handleDuplicate(row.original._id)}
            >
              Duplicate
            </Button>
          )}
          {can("can_delete_banner") && (
            <Button
              onClick={() => setDeleteOpen(row.original._id)}
              variant={"delete_button"}
              size={"base"}
            ></Button>
          )}
        </div>
      ),
      id: "actions",
      minSize: 260,
      visible: true,
      canHide: false,
    },
  ];

  return (
    <>
      <PageHeader
        title="Banner Builder"
        subtitle="Create and edit freeform banner templates. The storefront shows the one marked active — activating a template replaces the previous one."
        buttons={
          can("can_create_banner") ? <CreateBannerTemplate /> : undefined
        }
      />

      <GlobalTable
        tableName="banner_templates_table"
        data={templateData?.data || []}
        defaultColumns={defaultColumns}
        isLoading={isLoading}
        limit={20}
      />

      <Modal
        open={renameTarget !== null}
        onOpenChange={() => {
          setRenameTarget(null);
          setRenameValue("");
        }}
        title="Rename template"
      >
        <div className="flex flex-col gap-4">
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Template name"
          />
          <Button loading={isRenaming} onClick={handleRename}>
            Save
          </Button>
        </div>
      </Modal>

      <DeleteModal
        open={deleteOpen !== null}
        onOpenChange={() => setDeleteOpen(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete banner template"
      >
        <p className="text-gray">
          This is a destructive action and cannot be undone. If this template is
          the active one, the storefront will show no banner until you activate
          another.
        </p>
      </DeleteModal>
    </>
  );
};

export default BannerBuilderPage;
