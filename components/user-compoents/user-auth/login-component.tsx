"use client";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/lib/zod-schema/login.schema";
import { email, input, z } from "zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SupabaseAuthClient } from "@supabase/supabase-js/dist/module/lib/SupabaseAuthClient";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";

const LoginComponent = () => {
  // Create Supabase client
  const client = createClient();
  const [showPassword, setShowPassword] = useState(false);
  // Check if user is already signed in
  const checkAlreadySignedIn = async () => {
    startTransition(async () => {
      const { data } = await client.auth.getUser();
      if (data.user) {
        router.push("/home");
      }
    });
  };
  // Check if user is already signed in
  useEffect(() => {
    checkAlreadySignedIn();
  }, []);
  //use userRouter for redirections
  const router = useRouter();
  //disable button and input fields while logging in
  const [isPending, startTransition] = useTransition();
  //Handle User Login Action
  const userLoginHandler = async (userEmail: string, userPassword: string) => {
    //start transition for login
    startTransition(async () => {
      const { data, error } = await client.auth.signInWithPassword({
        email: userEmail,
        password: userPassword,
      });
      //handle login response
      if (error?.message === "Invalid login credentials") {
        toast("Invalid login credentials", {
          description: "Please check your email and password, then try again.",
          action: {
            label: "Refresh",
            onClick: () => window.location.reload(),
          },
        });
        return;
      } else if (data.user == null) {
        toast("Check Your Email To Verify", {
          description:
            "You are already registered. Please check your email to verify.",
          action: {
            label: "Open Email",
            onClick: () => window.open("https://mail.google.com", "_blank"),
          },
        });
        return;
      } else if (error) {
        toast("Login Failed", {
          description: "An error occurred while logging in. Please try again.",
          action: {
            label: "Refresh",
            onClick: () => window.location.reload(),
          },
        });
        return;
      }

      // Check if user exists in user table
      const res = await axios.post("/api/get-user-by-email-api", {
        email: userEmail,
      });

      const userData = await res.data;

      if (userData.success) {
        //redirect user to home page
        router.push("/home");
      } else {
        //redirect to doctor dashboard if not in user table
        router.push("/doctor/doctor-dashboard");
      }
    });
  };
  //handle the form submission
  const submitHandler = (data: z.infer<typeof LoginSchema>) => {
    console.log(data);
    userLoginHandler(data.email, data.password);
  };
  // Initialize form
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  return (
    <div className="flex flex-col md:flex-row md:justify-center md:items-center h-screen xl:bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className=" absolute top-4 left-4 ">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500  to-green-500 font-bold  text-2xl">
          <a href="/">CarePlus</a>
        </p>
      </div>
      <div className="flex flex-col xl:flex-row md:justify-center md:items-center w-full max-w-4xl  bg-white xl:p-10 rounded-xl xl:gap-16">
        <div className=" mb-10 md:mt-0 mt-24 h-96 justify-center items-center flex">
          <div>
            <Image
              src="/login-img.png"
              alt="Login Image"
              width={500}
              height={300}
            />
          </div>
        </div>
        <div className="h-2/3 bg-[#0095FF] mx-2 rounded-3xl md:rounded-xl md:p-5 rounded-tl-3xl flex flex-col justify-center items-center relative">
          <div className=" h-fit mb-3 flex flex-col justify-center items-center">
            {/** Login Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(submitHandler)}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel className="text-[20px] text-white">
                          Email
                        </FormLabel>
                        <FormControl>
                          <input
                            className="p-2 rounded-md bg-white text-black w-72"
                            type="email"
                            {...field}
                            placeholder="villiam@gmail.com"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel className="text-[20px] text-white">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative w-72">
                            <input
                              className="p-2 rounded-md bg-white text-black w-full pr-10"
                              type={showPassword ? "text" : "password"}
                              {...field}
                              placeholder="********"
                              disabled={isPending}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
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
                    );
                  }}
                />

                <Button
                  type="submit"
                  className="p-2  bg-[#291743] text-white w-72 rounded-full mt-10"
                  disabled={isPending}
                >
                  Login
                </Button>
              </form>
            </Form>
            <div className="mt-6 flex flex-col gap-3 items-center">
              <p className="text-white text-sm">
                Don&apos;t have an account?
                <a
                  className="ml-2 underline hover:text-[#00406E] transition-colors"
                  href="/signup"
                >
                  Sign Up
                </a>
              </p>
              <p className="text-white text-sm">
                Forgot your password?
                <a
                  className="ml-2 underline hover:text-[#00406E] transition-colors"
                  href="/reset-password"
                >
                  Reset it
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
