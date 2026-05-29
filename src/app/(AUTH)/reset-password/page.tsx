"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useResetPassword } from "@/hooks/useAuthActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Wifi, Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const resetPassword = useResetPassword();

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      router.push("/forgot-password");
    }
  }, [token, router]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;

    await resetPassword.mutateAsync({
      token,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="rounded-2xl p-0 gap-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-2xl font-bold">Password Reset Successful!</h1>
            </div>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-6">
                Your password has been reset successfully. You can now login
                with your new password.
              </p>
              <Link href="/login">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 rounded-xl">
                  Login Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="rounded-2xl p-0  w-md gap-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white text-center">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-white/90 text-sm mt-1">
              Enter your new password
            </p>
          </div>

          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            className="rounded-xl border-gray-200 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          className="rounded-xl border-gray-200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={resetPassword.isPending}
                  className="w-full bg-amber-500 hover:bg-amber-600 rounded-xl h-11"
                >
                  {resetPassword.isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
