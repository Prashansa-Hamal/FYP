"use client";

import { z } from "zod";
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
import { loginSchema, signupSchema } from "@/schemas";

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
}

export default function AuthForm({
  title,
  description,
  buttonText,
  href,
  isSignup,
}: AuthFormProps) {
  const formSchema = isSignup ? signupSchema : loginSchema;

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = (values: AuthFormValues) => {
    console.log("FORM SUBMITTED:", values);
  };

  return (
    <div className="w-svw h-svh flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{title}</CardTitle>
          <CardDescription className="text-center">
            {description}{" "}
            <Link
              href={href.url}
              className="text-black hover:text-gray-500 hover:underline"
            >
              {href.text}
            </Link>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Name (signup only) */}
              {isSignup && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="gap-0">
                      <FormLabel className="mb-2">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage className="text-end" />
                    </FormItem>
                  )}
                />
              )}

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="gap-0">
                    <FormLabel className="mb-2">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe@example.com" {...field} />
                    </FormControl>
                    <FormMessage className="text-end" />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="gap-0">
                    <FormLabel className="mb-2">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-end" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit" className="w-full">
                {buttonText}
              </Button>
            </form>
          </Form>
          <div className="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1">
            <span className="text-muted-foreground text-xs">Or</span>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              console.log(`oAuth ${isSignup ? "signup" : "login"} clicked.`);
            }}
          >
            {isSignup ? "Continue" : "Login"} with Google
          </Button>

          {isSignup && (
            <p className="text-muted-foreground mt-2 text-center text-xs">
              By signing up you agree to our{" "}
              <a className="underline hover:no-underline" href="#">
                Terms
              </a>
              .
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}