"use client";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axiosInstance";
import { globalError } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z
  .object({
    password: z
      .string({ error: "Please enter your password" })
      .min(6, "Password has to be at least 6 charecters"),
    confirmPassword: z.string({
      error: "Please enter your password",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords does not match",
    path: ["confirmPassword"],
  });

const ResetPassword = () => {
  const [passwordHidden, setPasswordHidden] = useState(true);
  const router = useRouter();

  const { theme } = useTheme();

  const params = useSearchParams();

  const token = params.get("token");
  const email = params.get("email");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { password } = values;

    axiosInstance
      .post(
        `/auth/reset-password`,
        { password, email },
        { headers: { Authorization: token } },
      )
      .then((res) => {
        toast.success(res.data.message);
        router.push("/login");
      })
      .catch((err) => {
        globalError(err);
      });
  }

  return (
    <div className="z-50 flex min-h-[60vh] w-[90vw] flex-col justify-center rounded-lg bg-background p-8 px-5 shadow-lg min-[540px]:px-10 md:w-[70vw] lg:w-1/2 2xl:w-1/3">
      <Image
        className="mx-auto pb-4"
        src={
          theme !== "dark"
            ? "/logo/dailyit-logo-black.png"
            : "/logo/dailyit-logo-white.png"
        }
        height={100}
        width={200}
        alt="Daily It logo"
      />
      <h2 className="pb-4 text-center text-2xl font-bold text-primary">
        Reset Password!
      </h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <label>Password *</label>
                <div className="relative">
                  <Input
                    className="bg-background-foreground"
                    {...field}
                    type={passwordHidden ? "password" : "text"}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setPasswordHidden(!passwordHidden)}
                  >
                    {passwordHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldState.error && (
                  <p className="text-sm text-red">{fieldState.error.message}</p>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <label>Confirm Password *</label>
                <div className="relative">
                  <Input
                    className="bg-background-foreground"
                    {...field}
                    type={passwordHidden ? "password" : "text"}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setPasswordHidden(!passwordHidden)}
                  >
                    {passwordHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldState.error && (
                  <p className="text-sm text-red">{fieldState.error.message}</p>
                )}
              </FormItem>
            )}
          />

          <Button className="mt-3">Reset</Button>
        </form>
      </Form>
    </div>
  );
};

export default ResetPassword;
