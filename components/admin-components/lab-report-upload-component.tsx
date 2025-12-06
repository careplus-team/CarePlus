"use client";
import React, { useState, useTransition } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { CldUploadWidget } from "next-cloudinary";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import labReportUpload from "@/lib/zod-schema/lab-report-upload-schema";
import axios from "axios";
import { UserRoundCheck } from "lucide-react";

const LabReportUploadComp = () => {
  const [profilePicButtonText, setProfilePicButtonText] =
    useState("Add Report File");

  const [isPending, startTransition] = useTransition();

  const [reportUpload, setReportUpload] = useState("/upload-place-holder.webp");
  const [reportInfo, setReportInfo] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [selectedPatientInfo, setSelectedPatientInfo] = useState<any>(null);

  //send report data to the database
  const saveToDbFunction = (data: any) => {
    startTransition(async () => {
      try {
        const uploadData = await axios.post("/api/upload-report-api", {
          patientEmail: selectedPatientInfo.email,
          title: data.title,
          reportUrl: data.reportUrl,
          description: data.description,
          patientName: selectedPatientInfo.name,
        });
        if (uploadData.data.success) {
          toast.success("Lab report uploaded successfully");
          form.reset();
          setPatientEmail("");
          setReportUpload("/upload-place-holder.webp");
          setPatientEmail("");
          setPatientInfo(null);
          setSelectedPatientInfo(null);
        } else {
          toast.error("Error uploading lab report: " + uploadData.data.message);
        }
      } catch (e) {
        toast.error("Error uploading lab report");
      }
    });
  };

  //search patient by email
  const searchPatientsByEmail = async () => {
    setSelectedPatientInfo(null);
    setPatientInfo(null);
    //validate email
    if (patientEmail === "") {
      setPatientInfo(null);
      setSelectedPatientInfo(null);
      toast.error("Please enter a valid email address.");
      return;
    }
    //search for patient
    startTransition(async () => {
      const patientData = await axios.post("/api/get-user-by-email-api", {
        email: patientEmail,
      });

      if (patientData.data.success && patientData.data.data != null) {
        console.log("Patient data found:", patientData.data.data);
        setPatientInfo(patientData.data.data);
      } else {
        setPatientInfo(null);
        setSelectedPatientInfo(null);
        toast.error("No patient found with this email.");
      }
    });
  };

  //inject patient info to the form
  const addUserInfo = () => {
    form.setValue("email", selectedPatientInfo.email);
    form.setValue("name", selectedPatientInfo.name);
  };

  //handle the form submission
  const submitHandler = () => {
    addUserInfo();
    //validations
    if (
      form.getValues().reportUrl === "" ||
      form.getValues().reportUrl === null ||
      form.getValues().reportUrl === undefined
    ) {
      toast.error("Please upload a lab report before submitting.");
      return;
    }
    if (form.getValues().title === "" || form.getValues().description === "") {
      toast.error("Please fill all the fields before submitting.");
      return;
    }
    if (
      form.getValues().email === null ||
      form.getValues().email === undefined ||
      form.getValues().email === ""
    ) {
      toast.error("Invalid patient information. Please search again.");
      return;
    }
    saveToDbFunction(form.getValues());
  };
  // Initialize form
  const form = useForm<z.infer<typeof labReportUpload>>({
    defaultValues: {
      reportUrl: "",
      title: "",
      description: "",
      email: "",
      name: "",
    },
  });
  return (
    <div className="md:flex justify-center  h-screen gap-10">
      <div className=" md:w-[50%] h-fit border-2 border-black/10 shadow-xl rounded-xl flex flex-col m-5 md:p-10 p-5">
        <div className="w-full text-2xl font-semibold flex justify-center items-center align-middle ">
          Upload Lab Reports
        </div>
        <div className="border-2 border-black/10 shadow-xl rounded-xl my-5 p-5">
          <div className="pb-5">Enter Lab Report Owner Email</div>
          <div className="flex gap-5">
            <Input
              disabled={isPending}
              value={patientEmail}
              onChange={(e) => {
                setPatientEmail(e.target.value);
              }}
              type="email"
              placeholder="Patient Email"
            />
            <Button
              disabled={isPending}
              onClick={searchPatientsByEmail}
              className=""
            >
              Search
            </Button>
          </div>
          {patientInfo ? (
            <div
              onClick={() =>
                !isPending
                  ? selectedPatientInfo
                    ? setSelectedPatientInfo(null)
                    : setSelectedPatientInfo(patientInfo)
                  : null
              }
              className={` cursor-pointer flex md:w-[80%] border-2 p-2 rounded-xl gap-10 items-center mt-10 ${
                selectedPatientInfo ? "bg-green-700 text-white" : ""
              }  `}
            >
              <Image
                src={patientInfo.profilePicture || "/user-placeholder.png"}
                alt="Lab Report Owner"
                width={50}
                height={50}
              />
              <div className="flex flex-col">
                <div className="text-lg font-semibold">{patientInfo.name}</div>
                <div>{patientInfo.email}</div>
              </div>
            </div>
          ) : (
            <div className="flex md:w-[80%] border-2 p-2 rounded-xl gap-10 items-center mt-10 ">
              <div className="flex text-black/40 gap-5">
                <UserRoundCheck></UserRoundCheck> Searched Patient's Details
                will Show Here
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 ">
          <div className="md:flex-col md:gap-6 xl:gap-10">
            {/* Report file section */}
            <div className="w-full md:w-auto flex flex-col items-center justify-start mb-4 md:mb-0">
              <div className="w-28 h-28 md:w-32 md:h-32 xl:w-36 xl:h-36 rounded-md bg-gradient-to-br from-[#e0e7ef] to-[#b6dfff] border-4 border-[#00B4D8] flex items-center justify-center shadow-lg overflow-hidden">
                <Button
                  disabled={!selectedPatientInfo || isPending}
                  className="bg-transparent hover:bg-transparent focus:ring-0 w-28 h-28 md:w-32 md:h-32 xl:w-36 xl:h-36 rounded-md "
                >
                  <Image
                    className="min-w-32 "
                    src={reportUpload}
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
                  clientAllowedFormats: [
                    "jpg",
                    "jpeg",
                    "png",
                    "gif",
                    "webp",
                    "pdf",
                  ],
                  multiple: false,
                  folder: "user_profile_pics",
                  maxFiles: 1,
                  resourceType: "auto",
                  tags: ["profile", "user"],
                }}
                onOpen={() => {
                  setReportUpload("/loading01.gif");
                }}
                onSuccess={(result, widget) => {
                  console.log("Upload added:", result);
                  setReportUpload("/upload-success.jpg");
                  setReportInfo(
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
                      "reportUrl",
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
                  console.log("Upload widget closed", reportUpload);
                  if (
                    reportUpload === "/upload-place-holder.webp" ||
                    reportUpload === "/loading01.gif"
                  ) {
                    setReportUpload("/upload-place-holder.webp");
                    //form.setValue("profilePicture", "/temp_user.webp");
                  }
                  console.log(form.getValues());
                }}
              >
                {({ open }) => {
                  return (
                    <Button
                      disabled={isPending || !selectedPatientInfo}
                      className="mt-5 bg-transparent text-black border-2 hover:bg-[#17431E] hover:text-white transition-colors duration-500"
                      onClick={() => {
                        open();
                        setProfilePicButtonText("Update Report File");
                      }}
                    >
                      {profilePicButtonText}
                    </Button>
                  );
                }}
              </CldUploadWidget>
            </div>

            {/* Form section */}
            <div className="flex-1 mt-10">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(submitHandler)}
                  className="bg-white rounded-2xl space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#00406E] font-semibold">
                            Report Title
                          </FormLabel>
                          <FormControl>
                            <input
                              minLength={3}
                              disabled={isPending || !selectedPatientInfo}
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
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#00406E] font-semibold">
                            Report Description
                          </FormLabel>
                          <FormControl>
                            <input
                              minLength={3}
                              disabled={isPending || !selectedPatientInfo}
                              type="text"
                              {...field}
                              className="w-full py-3 px-4 rounded-xl bg-[#F1F5F9] border border-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00B4D8] transition"
                              placeholder="Enter your email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-center ">
                    <Button
                      disabled={isPending || !selectedPatientInfo}
                      className="w-full mt-5 py-3 rounded-xl bg-[#17431E] text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                      type="submit"
                    >
                      Upload Lab Report
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <div className="border-2 border-green-500 md:w-[50%] md:p-10 p-5 m-5"></div>
    </div>
  );
};

export default LabReportUploadComp;
