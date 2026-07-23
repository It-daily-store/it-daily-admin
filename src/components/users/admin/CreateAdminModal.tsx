// import Divider from '@/components/custom/Divider'
import { TSelectOptions } from "@/components/categories/interface";
import Modal from "@/components/custom/Modal";
import { Button } from "@/components/ui/button";
import { Combobox, Option } from "@/components/ui/combobox";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TRole } from "@/interface/auth.interface";
import { globalError } from "@/lib/utils";
import { useGetRolesQuery } from "@/redux/api/rolesApi";
import { TCreateAdmin, useCreateAdminMutation } from "@/redux/api/usersApi";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type TProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const createAdminSchema = z.object({
  email: z
    .string({ error: "User name is required" })
    .email("Not a valid email"),
  name: z.object({
    firstName: z
      .string({ error: "FirstName is required" })
      .min(1, "FirstName is required"),
    middleName: z.string().optional(),
    lastName: z
      .string({ error: "LastName is required" })
      .min(1, "LastName is required"),
  }),
  password: z
    .string({
      error: "Password must be a string",
    })
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const CreateAdminModal = ({ open, setOpen }: TProps) => {
  const { data: roleData } = useGetRolesQuery(undefined);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roleError, setRoleError] = useState(false);
  const [createAdmin, { isLoading: isCreatingAdmin }] =
    useCreateAdminMutation();

  const form = useForm<z.infer<typeof createAdminSchema>>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      email: "",
      password: "",
      name: {
        firstName: "",
        middleName: "",
        lastName: "",
      },
    },
  });

  const selectOptions: Option[] = roleData?.data?.map((role: TRole) => {
    return {
      label: role.role,
      value: role._id,
      searchValue: role.role,
    };
  });

  async function onSubmit(values: z.infer<typeof createAdminSchema>) {
    setRoleError(false);
    if (!selectedRole) {
      setRoleError(true);
      toast.error("Please select role");
    } else {
      const payload: TCreateAdmin = {
        email: values.email,
        password: values.password,
        role: selectedRole,
        name: values.name,
      };

      try {
        const res = await createAdmin(payload).unwrap();
        toast.success(res.message);
        setOpen(false);
        form.reset();
        setSelectedRole(null);
      } catch (err) {
        console.log(err);
        globalError(err);
      }
    }
  }

  return (
    <div>
      <Modal
        open={open}
        onOpenChange={setOpen}
        triggerText="Create Admin"
        title="Create new admin"
        withTrigger={true}
      >
        <Form {...form}>
          <form
            className="flex flex-col gap-3"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="name.firstName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="flex flex-col gap-2">
                    <label>First Name *</label>
                    <Input {...field} placeholder="Enter first name" />
                  </div>
                  {fieldState.error && (
                    <p className="text-red">{fieldState.error.message}</p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name.middleName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="flex flex-col gap-2">
                    <label>Middle Name</label>
                    <Input {...field} placeholder="Enter middle name" />
                  </div>
                  {fieldState.error && (
                    <p className="text-red">{fieldState.error.message}</p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name.lastName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="flex flex-col gap-2">
                    <label>last Name *</label>
                    <Input {...field} placeholder="Enter last name" />
                  </div>
                  {fieldState.error && (
                    <p className="text-red">{fieldState.error.message}</p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="flex flex-col gap-2">
                    <label>Email *</label>
                    <Input {...field} placeholder="Enter user email" />
                  </div>
                  {fieldState.error && (
                    <p className="text-red">{fieldState.error.message}</p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="flex flex-col gap-2">
                    <label>Password *</label>
                    <Input {...field} placeholder="Enter a simple password" />
                  </div>
                  {fieldState.error && (
                    <p className="text-red">{fieldState.error.message}</p>
                  )}
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <label>Role *</label>
              <Combobox
                onChange={(val) => {
                  setSelectedRole(val as string);
                  setRoleError(false);
                }}
                value={selectedRole || ""}
                options={selectOptions}
              />

              {roleError && <p className="text-red">Select role</p>}
            </div>

            <div className="flex w-full justify-between gap-3">
              <Button
                type="button"
                className="w-full"
                variant={"delete_solid"}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button loading={isCreatingAdmin} className="w-full">
                Create
              </Button>
            </div>
          </form>
        </Form>
      </Modal>
    </div>
  );
};

export default CreateAdminModal;
