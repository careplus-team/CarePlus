"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

import {
  UserPlus,
  Upload,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  BookUserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { is } from "date-fns/locale";
import { doctorRegistrationSchema } from "@/lib/zod-schema/doctor-registration-schema";
import z from "zod";

function DoctorRegistrationComponent() {
  const [isPending, startTransition] = useTransition();
  const [profilePicButtonText, setProfilePicButtonText] = useState(
    "Add Profile Picture"
  );
  const client = createClient();
  const router = useRouter();
  const form = useForm<z.infer<typeof doctorRegistrationSchema>>({
    defaultValues: {
      name: "",
      email: "",
      gender: undefined,
      medicalregno: "",
      mobileNumber: "",
      address: "",
      dateOfBirth: "",
      specialization: "",
      currentWorkplace: "",
      password: "",
      confirmPassword: "",
      bio: "",
      profilePicture: "",
    },
  });
  const [profilePic, setProfilePic] = useState("/temp_user.webp");

  const registerUserFunction = (
    data: z.infer<typeof doctorRegistrationSchema>
  ) => {
    console.log("Register user function called with data:", data);

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
        if (data.dateOfBirth) {
          const dob = new Date(data.dateOfBirth);
          const today = new Date();
          age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
        }

        const registeredDoctorData = await axios.post(
          "/api/register-doctor-api",
          data
        );
        console.log("User data saved:", registeredDoctorData);

        if (
          registeredDoctorData.data.message ===
          "Doctor with this email already exists"
        ) {
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
            router.push("doctor/login");
          }, 5000);
        }
      }
    });
    setProfilePic("/temp_user.webp");
    form.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className=" absolute top-4 left-4 ">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500  to-green-500 font-bold  text-2xl">
          <a href="/">CarePlus</a>
        </p>
      </div>
      <div className="w-full  mt-10 max-w-5xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Stethoscope className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Doctor Registration
          </h1>
          <p className="text-blue-100 text-lg">
            Join our e-healthcare platform and start making a difference
          </p>
        </div>

        <div className="p-8 md:p-12">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-full md:w-auto flex flex-col items-center justify-start mb-4 md:mb-0">
              <div className="w-28 h-28 md:w-32 md:h-32 xl:w-36 xl:h-36 rounded-full bg-gradient-to-br from-[#e0e7ef] to-[#b6dfff] border-4 border-[#00B4D8] flex items-center justify-center shadow-lg overflow-hidden">
                <Button
                  disabled={isPending}
                  className="bg-transparent hover:bg-transparent focus:ring-0 w-28 h-28 md:w-32 md:h-32 xl:w-36 xl:h-36 rounded-full"
                >
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
                  sources: [
                    "local",
                    "url",
                    "camera",
                    "google_drive",
                    "facebook",
                  ],
                  clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
                  multiple: false,
                  folder: "user_profile_pics",
                  maxFiles: 1,
                  resourceType: "image",
                  tags: ["profile", "user"],
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
                      className="mt-5 bg-transparent text-black border-2 hover:bg-[#17431E] hover:text-white transition-colors duration-500"
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
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(registerUserFunction)}
              className="space-y-6"
            >
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Personal Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending}
                            placeholder="Enter your full name"
                            className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
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
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending}
                            type="email"
                            placeholder="doctor@example.com"
                            className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Mobile Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            disabled={isPending}
                            placeholder="07xxxxxxxx"
                            className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date of Birth
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            disabled={isPending}
                            className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Gender
                        </FormLabel>
                        <Select
                          disabled={isPending}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <BookUserIcon className="h-4 w-4" />
                          Bio
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            disabled={isPending}
                            placeholder="Briefly describe yourself"
                            className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
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
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending}
                            placeholder="Enter your complete address"
                            className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Professional Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="medicalregno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Medical Registration Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending}
                            placeholder="Enter your registration number"
                            className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Specialization
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending}
                            placeholder="e.g., Cardiology, Neurology"
                            className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentWorkplace"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Current Workplace
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending}
                            placeholder="e.g., City General Hospital"
                            className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1 bg-yellow-100 rounded-lg">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Security
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending}
                            type="password"
                            placeholder="Create a strong password"
                            className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
                          />
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
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending}
                            type="password"
                            placeholder="Confirm your password"
                            className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                disabled={isPending}
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                {isPending ? "Registering..." : "Register as Doctor"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-gray-600 mt-8">
            Already registered?{" "}
            <a
              href="/doctor/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DoctorRegistrationComponent;
