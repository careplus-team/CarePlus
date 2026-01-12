"use client";

import { useEffect, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoginSchema } from "@/lib/zod-schema/login.schema";
import { toast } from "sonner";
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
import { Ambulance, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";

const EmergencyManagerLoginComponent = () => {
  const router = useRouter();
  const client = createClient();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUserSession = async () => {
      const { data } = await client.auth.getUser();
      if (data.user) {
        // Optionally confirm role here again or just let the dashboard security wall handle it
        // For now, redirect to dashboard if logged in
        router.push("/emergency-manager");
      }
    };
    checkUserSession();
  }, [router, client.auth]);

  const handleLogin = (values: z.infer<typeof LoginSchema>) => {
    startTransition(async () => {
      try {
        const resp = await axios.post("/api/check-emg-manager", {
          email: values.email,
        });
        if (!resp?.data?.isAdmin) {
          toast.error("Unauthorized", {
            description: "You are not an authorized Emergency Manager.",
          });
          return;
        }
      } catch (err) {
        console.error("Role check failed", err);
        toast.error("Authorization check failed");
        return;
      }

      const { error } = await client.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error("Login Failed", {
          description: error.message,
        });
        return;
      }

      toast.success("Login Successful");
      router.push("/emergency-manager");
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4">
      <div className=" absolute top-4 left-4 ">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500  to-green-500 font-bold  text-2xl">
          <a href="/">CarePlus</a>
        </p>
      </div>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-600/20">
            <Ambulance className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Emergency Manager
          </h1>
          <p className="text-sm text-slate-500">
            Sign in to access the emergency dashboard
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      <Input
                        disabled={isPending}
                        placeholder="admin@careplus.com"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      <Input
                        disabled={isPending}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-balck text-sm">
              Forgot your password?
              <a
                className="ml-2 underline hover:text-[#00406E] transition-colors"
                href="/reset-password"
              >
                Reset it
              </a>
            </p>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isPending}
            >
              {isPending ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EmergencyManagerLoginComponent;
