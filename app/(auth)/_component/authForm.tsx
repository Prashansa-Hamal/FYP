"use client";

import { z } from "zod";
import { loginSchema, signupSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { startTransition, useState, useTransition } from "react";
import { signUp } from "../_actions/sign-up";
import { useRouter } from "next/navigation";
import { logIn } from "../_actions/sign-in";
import { oAuthSignin } from "../_actions/oAuth-signin";

import { Spinner } from "@/components/ui/spinner";
import { FormError, FormSuccess } from "./form-message";

type AuthFormValues = z.infer<typeof loginSchema | typeof signupSchema>;

interface AuthFormProps {
  title: string;
  description: string;
  buttonText: string;

  authType: "login" | "signup";
  href: {
    text: string;
    url: string;
  };
  isSignup?: boolean;

  errorMsg?: string | null;
  oauthError?: string;
}

export default function AuthForm({
  title,
  description,
  buttonText,
  authType,
  href,
  isSignup = false,
  errorMsg,
  oauthError,
}: AuthFormProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, setIsPending] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const formSchema = isSignup ? signupSchema : loginSchema;

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = (
    values: z.infer<typeof signupSchema> | z.infer<typeof loginSchema>
  ) => {
    setLoading(true);
    startTransition(() => {
      if (authType === "signup") {
        const signupValues = values as z.infer<typeof signupSchema>;
        signUp(signupValues).then((data) => {
          setLoading(false);
          setError(data.error);
          setSuccess(data.success);
          if (data.success) {
            router.push("/login");
          }
        });
      } else {
        const loginValues = values as z.infer<typeof loginSchema>;
        logIn(loginValues).then((data) => {
          setLoading(false);
          setError(data.error);
          setSuccess(data.success);
          if (data.success) {
            router.push("/");
          }
        });
      }
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto my-auto border-0 shadow-2xl shadow-gray-400 bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>
        <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          {description}{" "}
          <Link
            href={href.url}
            className="font-semibold text-blue-600 hover:text-blue-800 transition-colors hover:underline underline-offset-2"
          >
            {href.text}
          </Link>
          {!isSignup && oauthError && (
            <div className="mt-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {oauthError}
            </div>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-3"
          >
            {isSignup && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="John Doe"
                        className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="johndoe@example.com"
                      className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        disabled={isPending}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {isSignup && errorMsg && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-destructive flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  {errorMsg}
                </p>
              </div>
            )}

            {!isSignup && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  href="/forgotpassword"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            <FormError message={error} />
            <FormSuccess message={success} />

            <Button
              type="submit"
              size="lg"
              className="w-full text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              disabled={isPending}
            >
              {loading ? (
                <div className="flex items-center">
                  <Spinner />
                  <span className="ml-2">Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {buttonText}
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              )}
            </Button>
          </form>
        </Form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="lg"
          className="w-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          onClick={async () => {
            oAuthSignin("google");
          }}
          disabled={isPending}
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isSignup ? "Continue" : "Login"} with Google
        </Button>

        {isSignup && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              By signing up, you agree to our{" "}
              <a
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                href="#"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                href="#"
              >
                Privacy Policy
              </a>
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}