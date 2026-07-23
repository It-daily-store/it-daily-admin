import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import GlobalModal from "../common/GlobalModal";
import { TDeal } from "@/interface/deals.interface";
import { DatePicker } from "../ui/date-picker";

// Zod schema for form validation
const dealSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  description: z.string().optional(),
  image: z.string().optional().or(z.literal("")),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

type TProps = {
  open: boolean;
  setOpen: (_: boolean) => void;
  selected: TDeal | null;
};

const CreateDealModal = ({ open, setOpen, selected }: TProps) => {
  const defaultValues = {
    title: "",
    description: "",
    image: "",
    startTime: "",
    endTime: "",
  };

  // Initialize form with react-hook-form and zod
  const form = useForm<z.infer<typeof dealSchema>>({
    resolver: zodResolver(dealSchema),
    defaultValues,
  });

  useEffect(() => {
    if (selected) {
      form.reset({
        title: selected?.title || "",
        description: selected?.description || "",
        image: selected?.image || "",
        startTime: selected?.startTime || "",
        endTime: selected?.endTime || "",
      });
    } else {
      form.reset(defaultValues);
    }
  }, [selected]);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof dealSchema>) => {
    console.log("Form submitted:", data);
    // Add your submission logic here (e.g., API call)
    setOpen(false);
    form.reset();
  };

  return (
    <GlobalModal
      open={open}
      setOpen={setOpen}
      title={selected ? "Update deal" : "Create new deal"}
      subTitle={`Enter details to ${selected ? "update" : "create"}`}
      buttons={
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            {selected ? "Update" : "Create"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 my-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    className="bg-background"
                    placeholder="Enter deal title"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="bg-background"
                    placeholder="Enter deal description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input
                    className="bg-background"
                    placeholder="Enter image URL"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <DatePicker
                    disablePast
                    className="bg-background"
                    value={new Date(field.value)}
                    onChange={(val) => field.onChange(val?.toISOString())}
                    bordered
                    withTime
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <DatePicker
                    disablePast
                    className="bg-background"
                    value={new Date(field.value)}
                    onChange={(val) => field.onChange(val?.toISOString())}
                    bordered
                    withTime
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </GlobalModal>
  );
};

export default CreateDealModal;
