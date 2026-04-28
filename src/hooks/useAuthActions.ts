import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "@/types/auth";
import { useQuery } from "@tanstack/react-query";

async function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to send reset link");
  }

  return result;
}

async function resetPassword(
  data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to reset password");
  }

  return result;
}

async function changePassword(
  data: ChangePasswordRequest,
): Promise<ChangePasswordResponse> {
  const response = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to change password");
  }

  return result;
}

interface VerifyEmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  const response = await fetch(`/api/auth/verify-email?token=${token}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // The API redirects, so we need to check the final URL
  const finalUrl = response.url;
  const urlParams = new URLSearchParams(finalUrl.split("?")[1]);
  const success = urlParams.get("success");
  const error = urlParams.get("error");
  const message = urlParams.get("message");

  if (success === "true") {
    return {
      success: true,
      message: message || "Email verified successfully!",
    };
  } else {
    return { success: false, error: error || "Verification failed" };
  }
}

interface ResendVerificationRequest {
  email: string;
}

interface ResendVerificationResponse {
  success: boolean;
  message: string;
}

async function resendVerification(
  data: ResendVerificationRequest,
): Promise<ResendVerificationResponse> {
  const response = await fetch("/api/auth/resend-verification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to resend verification email");
  }

  return result;
}

export function useResendVerification() {
  return useMutation({
    mutationFn: resendVerification,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useEmailVerification(token: string | null) {
  return useQuery({
    queryKey: ["email-verification", token],
    queryFn: () => verifyEmail(token!),
    enabled: !!token,
    retry: 1,
    staleTime: 0,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
