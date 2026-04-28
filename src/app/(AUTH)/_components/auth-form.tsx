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
import Link from "next/link";
import { startTransition, useState, useTransition } from "react";
import { signUp } from "../_actions/sign-up";
import { useRouter } from "next/navigation";
import { logIn } from "../_actions/sign-in";
import { oAuthSignin } from "../_actions/oAuth-signin";
import { FormError, FormSuccess } from "@/components/form-message";
import { Spinner } from "@/components/ui/spinner";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Utensils,
  Coffee,
  ChefHat,
  ArrowRight,
} from "lucide-react";

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
    values: z.infer<typeof signupSchema> | z.infer<typeof loginSchema>,
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-[1000px] grid md:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Side - Decorative */}
        <div className="relative bg-gradient-to-br from-amber-600 to-orange-600 p-8 hidden md:flex flex-col justify-between">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-bold text-xl">DineEase</span>
            </div>

            <div className="space-y-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <ChefHat className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">
                Welcome to
                <br />
                DineEase
              </h2>
              <p className="text-white/80 leading-relaxed">
                Experience the finest dining with our seamless reservation and
                ordering system.
              </p>
              <div className="pt-6 space-y-3">
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">Easy table reservations</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">Quick order management</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">Loyalty rewards program</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-12">
            <div className="flex items-center gap-4 text-white/60 text-xs">
              <span>© 2024 DineEase</span>
              <span>•</span>
              <span>Fine Dining Experience</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="md:hidden flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-500 text-sm">
              {description}{" "}
              <Link
                href={href.url}
                className="text-amber-600 font-semibold hover:text-amber-700 transition-colors"
              >
                {href.text}
              </Link>
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-5"
            >
              {isSignup && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                          <Input
                            disabled={isPending}
                            placeholder="John Doe"
                            className="pl-10 h-12 rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400 transition-all duration-200 bg-gray-50/50"
                            {...field}
                          />
                        </div>
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
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                        <Input
                          disabled={isPending}
                          placeholder="you@example.com"
                          className="pl-10 h-12 rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400 transition-all duration-200 bg-gray-50/50"
                          {...field}
                        />
                      </div>
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
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                        <Input
                          disabled={isPending}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400 transition-all duration-200 bg-gray-50/50"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {!isSignup && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <FormError message={error || (errorMsg as any)} />
              <FormSuccess message={success} />

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group"
                disabled={isPending}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {buttonText}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 rounded-xl transition-all duration-200"
            onClick={() => oAuthSignin("google")}
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
            Continue with Google
          </Button>

          {oauthError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 text-center">{oauthError}</p>
            </div>
          )}

          {isSignup && (
            <div className="mt-6 pt-4 text-center">
              <p className="text-xs text-gray-500">
                By signing up, you agree to our{" "}
                <a
                  href="#"
                  className="text-amber-600 hover:text-amber-700 hover:underline"
                >
                  Terms
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-amber-600 hover:text-amber-700 hover:underline"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          )}

          {/* Mobile Restaurant Info */}
          <div className="md:hidden mt-6 pt-4 border-t border-gray-100 text-center">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Coffee className="w-3 h-3" />
                <span>Fine Dining</span>
              </div>
              <div className="flex items-center gap-1">
                <ChefHat className="w-3 h-3" />
                <span>Expert Chefs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
