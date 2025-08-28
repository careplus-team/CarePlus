"use client";
import React, { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { set, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchema } from "@/lib/zod-schema/signup.schema";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CldUploadWidget } from "next-cloudinary";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createClient } from "@/lib/supabase/client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SignUpComponent = () => {
  const [profilePicButtonText, setProfilePicButtonText] = useState(
    "Add Profile Picture"
  );
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const alreadyUserLogout = async () => {
    const client = createClient();
    if ((await client.auth.getClaims()).data != null) {
      console.log("alreday user", await client.auth.getUser());
      client.auth.signOut();
    }
  };

  useEffect(() => {
    alreadyUserLogout();
  }, []);

  const [profilePic, setProfilePic] = useState("/temp_user.webp");
  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      age: undefined,
      gender: undefined,
      username: "",
      dateofbirth: "",
      mobilenumber: "",
      address: "",
      profilePicture: "/temp_user.webp",
    },
  });

  const registerUserFunction = (data: any) => {
    startTransition(async () => {
      console.log("Registering user with data:", data);
      const client = createClient();
      const userData = await client.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm?next=/home`,
        },
      });
      console.log("User registered:", userData);
      if (!userData.data.user?.user_metadata.email) {
        //get error when already signed-up user (email verified one) try to signup again

        toast("Already Exist User", {
          description: "You are already registered . Please login.",
          action: {
            label: "Login",
            onClick: () => router.push("/login"),
          },
        });
        return;
      }

      if (userData.data.user?.id) {
        // Calculate age from dateofbirth
        let age = undefined;
        if (data.dateofbirth) {
          const dob = new Date(data.dateofbirth);
          const today = new Date();
          age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
        }

        const savedUserData = await client.from("user").insert({
          role: data.role || "user",
          email: data.email,
          name: data.name,
          age: age,
          gender: data.gender,
          username: data.username,
          dateofbirth: data.dateofbirth,
          mobilenumber: data.mobilenumber,
          address: data.address,
          profilePicture: data.profilePicture,
        });
        console.log("User data saved:", savedUserData);

        if (savedUserData.status === 409) {
          //this error occure when user who already sign-up and not verified his email try to resign-up
          toast("Check Your Email To Verify", {
            description:
              "You are already registered. Please check your email to verify.",
            action: {
              label: "Open Email",
              onClick: () => window.open("https://mail.google.com", "_blank"),
            },
          });
          return;
        } else {
          toast("Registration Successful", {
            description: "Please Check Your Email to Verify.",
            action: {
              label: "Open Email",
              onClick: () => window.open("https://mail.google.com", "_blank"),
            },
          });
          setTimeout(() => {
            router.push("/login");
          }, 5000);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00406E] via-[#0077B6] to-[#00B4D8] flex items-center justify-center px-2 py-4">
      <div className="w-full max-w-md mx-auto mb-10">
        <div className="text-2xl font-extrabold text-center text-white mb-6 drop-shadow-lg">
          Care at your fingertips{" "}
          <span className="text-[#FFD166]">CarePlus</span>
        </div>
        <div className="bg-white rounded-3xl shadow-3xl p-6">
          <div className="w-full   justify-center align-middle items-center mb-4 flex flex-col  ">
            <div className="w-28 h-28 rounded-full  bg-gradient-to-br from-[#e0e7ef] to-[#b6dfff] border-4 border-[#00B4D8] flex items-center justify-center shadow-lg overflow-hidden">
              {/* Placeholder icon */}

              <Button className="bg-transparent hover:bg-transparent focus:ring-0 w-28 h-28 rounded-full ">
                <Image
                  className="min-w-32"
                  src={profilePic}
                  alt="Placeholder Icon"
                  objectFit="contain"
                  width={100}
                  height={100}
                />
              </Button>
            </div>
            <CldUploadWidget
              uploadPreset="careplus"
              options={{
                sources: ["local", "url", "camera", "google_drive", "facebook"],
                clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp"], // ✅ restrict formats
                multiple: false, // allow only one image
                folder: "user_profile_pics", // save in Cloudinary folder
                maxFiles: 1, // limit number of files
                resourceType: "image", // or "video"
                tags: ["profile", "user"], // add tags
              }}
              onOpen={() => {
                setProfilePic("/loading01.gif");
              }}
              onSuccess={(result, widget) => {
                console.log("Upload added:", result);
                setProfilePic(
                  typeof result.info === "object" &&
                    result.info !== null &&
                    "secure_url" in result.info
                    ? String(
                        (result.info as { secure_url?: string }).secure_url
                      )
                    : ""
                );
                if (result.event === "success") {
                  form.setValue(
                    "profilePicture",
                    typeof result.info === "object" &&
                      result.info !== null &&
                      "secure_url" in result.info
                      ? (result.info as { secure_url?: string }).secure_url ||
                          ""
                      : ""
                  );
                }
                console.log(form.getValues());
              }}
              onAbort={() => {
                console.log("Upload widget closed", profilePic);
                if (
                  profilePic === "/temp_user.webp" ||
                  profilePic === "/loading01.gif"
                ) {
                  setProfilePic("/temp_user.webp");
                  form.setValue("profilePicture", "/temp_user.webp");
                }
                console.log(form.getValues());
              }}
            >
              {({ open }) => {
                return (
                  <Button
                    disabled={isPending}
                    className="mt-5 bg-transparent text-black border-2 hover:bg-[#17431E] hover:text-white transition-colors duration-500 "
                    onClick={() => {
                      open();
                      setProfilePicButtonText("Update Profile Picture");
                    }}
                  >
                    {profilePicButtonText}
                  </Button>
                );
              }}
            </CldUploadWidget>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(registerUserFunction)}
              className="bg-white rounded-2xl   space-y-4"
            >
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#00406E] font-semibold">
                        Name
                      </FormLabel>
                      <FormControl>
                        <input
                          disabled={isPending}
                          type="text"
                          {...field}
                          className="w-full py-3 px-4 rounded-xl bg-[#F1F5F9] border border-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition"
                          placeholder="Enter your name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#00406E] font-semibold">
                        Email
                      </FormLabel>
                      <FormControl>
                        <input
                          disabled={isPending}
                          type="email"
                          {...field}
                          className="w-full py-3 px-4 rounded-xl bg-[#F1F5F9] border border-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition"
                          placeholder="Enter your email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#00406E] font-semibold">
                        Address
                      </FormLabel>
                      <FormControl>
                        <input
                          disabled={isPending}
                          type="text"
                          {...field}
                          className="w-full py-3 px-4 rounded-xl bg-[#F1F5F9] border border-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition"
                          placeholder="Enter your address"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex gap-3">
                  <FormField
                    control={form.control}
                    name="dateofbirth"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-[#00406E] font-semibold">
                          Date Of Birth
                        </FormLabel>
                        <FormControl>
                          <input
                            disabled={isPending}
                            type="date"
                            {...field}
                            className="w-full py-3 px-4 rounded-xl bg-[#F1F5F9] border border-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-[#00406E] font-semibold">
                          Gender
                        </FormLabel>
                        <FormControl>
                          <select
                            disabled={isPending}
                            {...field}
                            className="w-full py-3 px-4 rounded-xl bg-[#F1F5F9] border border-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition"
                          >
                            <option value="" disabled>
                              Select Gender
                            </option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-3">
                  <FormField
                    control={form.control}
                    name="mobilenumber"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-[#00406E] font-semibold">
                          Mobile Number
                        </FormLabel>
                        <FormControl>
                          <input
                            disabled={isPending}
                            type="text"
                            {...field}
                            className="w-full py-3 px-4 rounded-xl bg-[#F1F5F9] border border-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition"
                            placeholder="Enter mobile number"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-[#00406E] font-semibold">
                          Username
                        </FormLabel>
                        <FormControl>
                          <input
                            disabled={isPending}
                            type="text"
                            {...field}
                            className="w-full py-3 px-4 rounded-xl bg-[#F1F5F9] border border-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition"
                            placeholder="Choose a username"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#00406E] font-semibold">
                        Password
                      </FormLabel>
                      <FormControl>
                        <input
                          disabled={isPending}
                          type="password"
                          {...field}
                          className="w-full py-3 px-4 rounded-xl bg-[#F1F5F9] border border-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition"
                          placeholder="Enter password"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#00406E] font-semibold">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <input
                          disabled={isPending}
                          type="password"
                          {...field}
                          className="w-full py-3 px-4 rounded-xl bg-[#F1F5F9] border border-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition"
                          placeholder="Re-enter password"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-center mt-6">
                <Button
                  disabled={isPending}
                  className="w-full py-3 rounded-xl bg-[#17431E] text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  type="submit"
                >
                  Sign Up
                </Button>
              </div>
              <div className="text-center mt-4 text-sm text-[#00406E]">
                Already have an account?{" "}
                <a
                  className="text-[#00B4D8] font-semibold underline"
                  href="/login"
                >
                  Login
                </a>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SignUpComponent;
