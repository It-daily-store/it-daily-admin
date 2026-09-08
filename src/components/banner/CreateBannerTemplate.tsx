"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createDefaultTemplate } from "react-bannerkit";
import Modal from "../custom/Modal";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useCreateTemplateMutation } from "@/redux/api/bannerApi";
import { globalError } from "@/lib/utils";
import { toast } from "sonner";

const CreateBannerTemplate = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [createTemplate, { isLoading }] = useCreateTemplateMutation();
  const router = useRouter();

  const handleCreate = async () => {
    if (!name) {
      toast.warning("Please enter a template name");
      return;
    }
    const draft = createDefaultTemplate({ name });
    try {
      const res = await createTemplate({
        name,
        breakpoints: draft.breakpoints,
      }).unwrap();
      toast.success(res.message);
      setOpen(false);
      setName("");
      router.push(`/storefront/banner-builder/${res.data._id}`);
    } catch (err) {
      globalError(err);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={() => setOpen(!open)}
      title="New banner template"
      triggerText="New Template"
      withTrigger={true}
    >
      <div className="flex flex-col gap-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Template name"
        />
        <Button loading={isLoading} onClick={handleCreate}>
          Create
        </Button>
      </div>
    </Modal>
  );
};

export default CreateBannerTemplate;
