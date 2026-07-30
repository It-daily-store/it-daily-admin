"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axiosInstance";
import { globalError } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  setVerificationSentTime,
  updateAuthData,
} from "@/redux/reducers/auth/authSlice";
import dayjs from "@/components/utilities/Customdayjs";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Mail } from "lucide-react";
import { useTheme } from "next-themes";

const formSchema = z.object({
  email: z.string().email("Invalid email"),
});

const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [isSending, setSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { verificationSentTime } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<"otp" | "verify">("verify");
  const [otp, setOtp] = useState("");
  const email = searchParams ? searchParams.get("email") : "";

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setTab(tab as "otp" | "verify");
    }
  }, [searchParams]);

  const verifyForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email || "",
    },
  });

  function verifyOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (email && otp && otp.length === 6) {
      setIsVerifying(true);

      axiosInstance
        .post("/auth/verify-otp", {
          email,
          otp: otp,
        })
        .then((res) => {
          // console.log(res);
          if (res.data.data) {
            toast.success(res.data?.message);
            dispatch(
              updateAuthData({
                isAuthenticated: res.data.data.token !== null,
                token: res.data.data.accessToken,
                isVerified: true,
                permissions: [],
                user: null,
              }),
            );
            router.push("/");
          }
        })
        .catch((err) => {
          console.log(err);
          globalError(err.response);
        })
        .finally(() => {
          setIsVerifying(false);
        });
    } else {
      toast.error("Please enter complete verification code.");
    }
  }

  function verifySubmit(values: z.infer<typeof formSchema>) {
    const verifyLinkSentMinutes = dayjs().diff(
      dayjs(verificationSentTime),
      "minutes",
    );

    if (verificationSentTime !== null && verifyLinkSentMinutes <= 0.3) {
      return toast.warning(
        `A email with varification code has already been sent to your address. Please try again ${dayjs(verificationSentTime)?.add(30, "seconds")?.from(dayjs())}`,
      );
    }

    const { email } = values;
    setSending(true);

    axiosInstance
      .post(`/auth/send-verification`, { email })
      .then((res) => {
        toast.success(res.data.message);
        router.push(`/verify-email?email=${email}&tab=otp`);
        dispatch(setVerificationSentTime(dayjs().toISOString()));
        setSending(false);
      })
      .catch((err) => {
        dispatch(setVerificationSentTime(null));
        console.log(err.response);
        globalError(err.response);
        setSending(false);
      });
  }

  return (
    <div className="z-50 flex min-h-[40vh] w-[90vw] flex-col justify-center rounded-lg bg-background p-8 px-5 shadow-lg min-[540px]:px-10 md:w-[70vw] lg:w-1/2 2xl:w-1/3">
      {tab === "otp" && email ? (
        <div>
          <div className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Verify Your Email
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We&apos;ve sent a 6-digit verification code to
                <br />
                <span className="font-semibold text-gray-900">{email}</span>
              </p>
            </div>
          </div>
          <form onSubmit={verifyOtp} className="space-y-4">
            <div className="space-y-4">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 text-center"
              >
                Enter verification code
              </label>
              <div className="flex justify-center">
                <InputOTP
                  id="otp"
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isVerifying}
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={0}
                      className="w-12 h-12 text-lg font-semibold"
                    />
                    <InputOTPSlot
                      index={1}
                      className="w-12 h-12 text-lg font-semibold"
                    />
                    <InputOTPSlot
                      index={2}
                      className="w-12 h-12 text-lg font-semibold"
                    />
                  </InputOTPGroup>
                  <InputOTPSeparator className="text-gray-400" />
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={3}
                      className="w-12 h-12 text-lg font-semibold"
                    />
                    <InputOTPSlot
                      index={4}
                      className="w-12 h-12 text-lg font-semibold"
                    />
                    <InputOTPSlot
                      index={5}
                      className="w-12 h-12 text-lg font-semibold"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={otp.length !== 6 || isVerifying}
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                "Verify Code"
              )}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <p className="text-sm text-dark-gray mt-2">
              Didn&apos;t receive the code?{" "}
              <button className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
                Resend code
              </button>
            </p>

            {/* {onChangeEmail && (
                                <button
                                    type="button"
                                    onClick={onChangeEmail}
                                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors group"
                                >
                                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                    Change email address
                                </button>
                            )} */}
          </div>
        </div>
      ) : (
        <Form {...verifyForm}>
          <form
            onSubmit={verifyForm.handleSubmit(verifySubmit)}
            className="flex flex-col gap-5"
          >
            <Image
              className="mx-auto"
              src={
                theme !== "dark"
                  ? "/logo/dailyit-logo-black.png"
                  : "/logo/dailyit-logo-white.png"
              }
              height={100}
              width={200}
              alt="Daily It logo"
            />
            <h2 className="text-center text-2xl font-bold text-primary">
              Verify Your Email!
            </h2>
            <FormField
              control={verifyForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <label>Email *</label>
                  <FormControl>
                    <Input
                      className="bg-background-foreground"
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button loading={isSending} className="mt-3">
              Send Verification Code
            </Button>
          </form>
        </Form>
      )}

      <button type="button" className="mt-3 text-base">
        Go back to{" "}
        <span
          onClick={() => router.push("/login")}
          className="text-base text-primary cursor-pointer hover:underline"
        >
          login
        </span>
      </button>
    </div>
  );
};

export default VerifyEmail;
