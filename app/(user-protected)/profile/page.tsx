"use client";

import React, { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "sonner";
import {
  UserProfileSchema,
  DoctorProfileSchema,
} from "@/lib/zod-schema/profile.schema";
import { ZodError } from "zod";
import LoadingUI from "@/lib/UI-helpers/loading-ui";

export default function ProfilePage() {
  const [isPending, startTransition] = useTransition();
  const [userAuth, setUserAuth] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileType, setProfileType] = useState<"user" | "doctor" | null>(
    null
  );
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const resolver = React.useCallback(
    async (values: any) => {
      try {
        if (profileType === "doctor") {
          DoctorProfileSchema.parse(values);
        } else {
          UserProfileSchema.parse(values);
        }

        return { values: values, errors: {} };
      } catch (e) {
        if (e instanceof ZodError) {
          const errors: any = {};
          e.issues.forEach((issue) => {
            const key =
              issue.path && issue.path.length ? String(issue.path[0]) : "_";
            errors[key] = {
              type: "validation",
              message: issue.message,
            };
          });
          return { values: {}, errors };
        }
        return { values: {}, errors: {} };
      }
    },
    [profileType]
  );

  const form = useForm<any>({
    resolver,
    defaultValues: {
      email: "",
      name: "",
      mobilenumber: "",
      gender: "",
      dateofbirth: "",
      address: "",
      specialization: "",
      medicalregno: "",
      workplace: "",
      bio: "",
      profilePicture: "",
      username: "",
      age: undefined,
    },
  });

  useEffect(() => {
    if (profileData) {
      // reset form values when profile loads
      form.reset(profileData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData]);

  useEffect(() => {
    startTransition(async () => {
      const client = createClient();
      const { data } = await client.auth.getUser();
      setUserAuth(data.user);
      if (data?.user?.email) {
        try {
          // try user table first
          const userRes = await axios.post("/api/get-user-by-email-api", {
            email: data.user.email,
          });

          if (userRes.data?.success && userRes.data?.data) {
            setProfileData(userRes.data.data);
            setProfileType("user");
            setLoading(false);
            return;
          }

          // fallback to doctor
          const doctorRes = await axios.post("/api/doctor-details-get-api", {
            email: data.user.email,
          });
          if (doctorRes.data?.success && doctorRes.data?.data) {
            setProfileData(doctorRes.data.data);
            setProfileType("doctor");
            setLoading(false);
            return;
          }

          setProfileData(null);
          setProfileType(null);
          setLoading(false);
        } catch (e) {
          console.error(e);
          toast.error("Failed to load profile data");
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
  }, []);

  // use react-hook-form submit so we show inline errors from the resolver
  const onSubmit = form.handleSubmit(
    async (values: any) => {
      setIsSaving(true);
      startTransition(async () => {
        try {
          const url =
            profileType === "doctor"
              ? "/api/update-doctor-profile"
              : "/api/update-user-profile";
          const res = await axios.post(url, { data: values });
          if (res.data?.success) {
            toast.success("Profile updated");
            setEditMode(false);
            // sync local profileData with saved values
            setProfileData(values);
            form.reset(values);
          } else {
            toast.error(res.data?.message || "Update failed");
          }
        } catch (e) {
          console.error(e);
          toast.error("Update failed");
        } finally {
          setIsSaving(false);
        }
      });
    },
    (errors: any) => {
      // handle validation errors: show first message
      const first = Object.values(errors)[0] as any;
      if (first?.message) toast.error(String(first.message));
    }
  );

  // helper to update profile picture into the form
  const setProfilePicture = (url: string) => {
    form.setValue("profilePicture", url, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingUI />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:p-8 max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border relative">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-20 md:h-20 lg:w-20 lg:h-20 rounded-full overflow-hidden bg-slate-100 mx-auto sm:mx-0">
            <Image
              src={profileData?.profilePicture || "/temp_user.webp"}
              alt={profileData?.name || userAuth?.email || "Profile"}
              width={144}
              height={144}
              className="object-cover w-full h-full"
            />

            {/* In-place upload: only available when editing and not currently saving */}
            {editMode && !isSaving && (
              <div className="absolute inset-0 flex items-center justify-center">
                <CldUploadWidget
                  uploadPreset="careplus"
                  options={{
                    sources: ["local", "url", "camera", "google_drive"],
                    multiple: false,
                    folder: "user_profile_pics",
                    maxFiles: 1,
                    resourceType: "image",
                  }}
                  onOpen={() => {
                    toast("Opening upload widget...");
                  }}
                  onAbort={() => {
                    toast("Upload aborted");
                  }}
                  onSuccess={(res: any) => {
                    const url =
                      typeof res.info === "object" && "secure_url" in res.info
                        ? res.info.secure_url
                        : undefined;
                    if (url) {
                      // update form value and local preview
                      setProfilePicture(url);
                      setProfileData((p: any) => ({
                        ...p,
                        profilePicture: url,
                      }));
                      toast.success("Image uploaded");
                    }
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      aria-label="Upload profile photo"
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/20 hover:bg-black/25 text-white flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      >
                        <path
                          d="M12 20h9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </CldUploadWidget>
              </div>
            )}

            {/* Saving overlay (blocks inputs & clicks) */}
            {isSaving && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 border-2 border-gray-400 rounded-full border-t-transparent animate-spin" />
                  <span className="font-medium text-gray-700">
                    Saving your changes...
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-semibold">
              {profileData?.name || userAuth?.email}
            </h2>
            <p className="text-sm text-gray-500">{profileType || "user"}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto"
              variant={editMode ? "secondary" : "default"}
              onClick={() => setEditMode((s) => !s)}
              disabled={isSaving}
            >
              {editMode ? "Cancel" : "Change profile info"}
            </Button>
            {editMode && (
              <Button
                className="bg-emerald-600 w-full sm:w-auto"
                onClick={onSubmit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    Saving your changes
                  </span>
                ) : (
                  "Save"
                )}
              </Button>
            )}
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {/* Email - always non-editable */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!editMode || isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mobile / Phone */}
            <FormField
              control={form.control}
              name="mobilenumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!editMode || isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gender */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={!editMode || isSaving}
                      className="w-full rounded-md bg-white border px-3 py-2"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DOB */}
            <FormField
              control={form.control}
              name="dateofbirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      disabled={!editMode || isSaving}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <div className="sm:col-span-2 lg:col-span-3">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!editMode || isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Doctor-specific fields */}
            {profileType === "doctor" && (
              <>
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!editMode || isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalregno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Reg No</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!editMode || isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workplace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workplace</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!editMode || isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="sm:col-span-2 lg:col-span-3">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            disabled={!editMode || isSaving}
                            className="w-full rounded-md border px-3 py-2"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="profilePicture"
                  render={({ field }) => (
                    <FormItem className="sr-only">
                      <FormControl>
                        <input type="hidden" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Non-doctor users still need profilePicture field present */}
            {profileType !== "doctor" && (
              <FormField
                control={form.control}
                name="profilePicture"
                render={({ field }) => (
                  <FormItem className="sr-only">
                    <FormControl>
                      <input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {/* submit is handled by Save button */}
          </form>
        </Form>
      </div>
    </div>
  );
}
