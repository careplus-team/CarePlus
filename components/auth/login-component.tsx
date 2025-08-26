"use client";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/lib/zod-schema/login.schema";
import { email, input, z } from "zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

const LoginComponent = () => {
  // Create Supabase client
  const client = createClient();
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
      if (error) {
        console.log("Error logging in:", error);
      }
      console.log("Login successful:", data);
      //redirect user to home page
      router.push("/home");
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
    <div className="flex flex-col h-screen">
      <div className="  h-96 justify-center items-center flex">
        <div>
          <Image
            src="/login-img.png"
            alt="Login Image"
            width={500}
            height={300}
          />
        </div>
      </div>
      <div className=" h-2/3 bg-[#0095FF] rounded-tr-3xl rounded-tl-3xl flex flex-col justify-center items-center">
        <div className="rounded-full h-fit  relative top-[-30px]">
          <Image
            src="/logo.jpg"
            alt="Login Image"
            width={100}
            height={100}
            className="rounded-full"
          />
        </div>
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
                        <input
                          className="p-2 rounded-md bg-white text-black w-72"
                          type="password"
                          {...field}
                          placeholder="********"
                          disabled={isPending}
                        />
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
          <div className="mt-5">
            <p>
              Don't have an account?{" "}
              <a
                disabled={isPending}
                className="text-white ml-1"
                href="/register"
              >
                Sign Up
              </a>{" "}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
