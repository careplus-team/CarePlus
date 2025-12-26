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
import {
  Files,
  FolderSync,
  Shredder,
  Unplug,
  UserRoundCheck,
} from "lucide-react";
import { is } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LabReportUploadComp = () => {
  const [profilePicButtonText, setProfilePicButtonText] =
    useState("Add Report File");

  const [isPending, startTransition] = useTransition();

  const [reportUpload, setReportUpload] = useState("/upload-place-holder.webp");
  const [reportInfo, setReportInfo] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [selectedPatientInfo, setSelectedPatientInfo] = useState<any>(null);

  {
    /*manage lab report functions*/
  }

  const [isPendingMng, startTransitionMng] = useTransition();

  const [reportUploadMng, setReportUploadMng] = useState(
    "/upload-place-holder.webp"
  );
  const [reportInfoMng, setReportInfoMng] = useState<any>(null);
  const [patientEmailMng, setPatientEmailMng] = useState("");
  const [patientInfoMng, setPatientInfoMng] = useState<any>(null);
  const [selectedPatientInfoMng, setSelectedPatientInfoMng] =
    useState<any>(null);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  //search patient by email
  const searchPatientsByEmailMng = async () => {
    setSelectedPatientInfoMng(null);
    setPatientInfoMng(null);
    //validate email
    if (patientEmailMng === "") {
      setPatientInfoMng(null);
      setSelectedPatientInfoMng(null);
      toast.error("Please enter a valid email address.");
      return;
    }
    //search for patient
    startTransitionMng(async () => {
      const patientDataMng = await axios.post("/api/get-user-by-email-api", {
        email: patientEmailMng,
      });

      if (patientDataMng.data.success && patientDataMng.data.data != null) {
        console.log("Patient data found:", patientDataMng.data.data);
        setPatientInfoMng(patientDataMng.data.data);
      } else {
        setPatientInfoMng(null);
        setSelectedPatientInfoMng(null);
        toast.error("No patient found with this email.");
      }
    });
  };

  //get patient's all reports

  const getPatientReports = (email: string) => {
    console.log("Fetching reports for:", email);
    startTransitionMng(async () => {
      const userReportData = await axios.post(
        "/api/get-reports-by-user-email-api",
        {
          email: email,
        }
      );
      console.log("User report data:", userReportData);
      if (userReportData.data.success && userReportData.data.data != null) {
        setReportInfoMng(userReportData.data.data);
      } else {
        setReportInfoMng(null);
        toast.error("No reports found for this patient.");
      }
    });
  };

  //delete report function

  const deleteReport = (id: string) => {
    startTransitionMng(async () => {
      try {
        const deleteReportData = await axios.post(
          "/api/delete-lab-report-api",
          {
            reportId: id,
          }
        );
        if (deleteReportData.data.success) {
          toast.success("Lab report deleted successfully");
          getPatientReports(selectedPatientInfoMng.email);
        } else {
          toast.error(
            "Error deleting lab report: " + deleteReportData.data.message
          );
        }
      } catch (e) {
        toast.error("Error deleting lab report");
      }
    });
  };
  {
    /* Upload Lab Report Functions */
  }
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
    setShowUploadDialog(true);
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
    <div className="md:p-5">
      <div className=" absolute top-4 left-4 ">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500  to-green-500 font-bold  text-2xl">
          <a href="/">CarePlus</a>
        </p>
      </div>
      <div className="p-5 flex mt-14 gap-5 align-middle items-center text-3xl md:text-4xl font-bold">
        {" "}
        <Shredder className="size-9"></Shredder>Manage Lab Reports
      </div>
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
                className={` cursor-pointer flex md:w-[80%] border-2 p-2 rounded-xl gap-2 md:gap-10 items-center mt-10 ${
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
                  <div className="text-lg font-semibold">
                    {patientInfo.name}
                  </div>
                  <div>{patientInfo.email}</div>
                </div>
              </div>
            ) : !isPending ? (
              <div className="flex md:w-[80%] border-2 p-2 rounded-xl gap-10 items-center mt-10 ">
                <div className="flex text-black/40 gap-5">
                  <UserRoundCheck></UserRoundCheck> Searched Patient's Details
                  will Show Here
                </div>
              </div>
            ) : (
              <div className="flex md:w-[80%] border-2 p-2 rounded-xl gap-10 items-center mt-10 ">
                <div className="flex text-black/40 gap-5">
                  <Unplug /> Retrieving Patient's Details...
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
                    folder: "user_reports",
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
                          ? (result.info as { secure_url?: string })
                              .secure_url || ""
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
        <div className="border-2 h-fit border-black/10 shadow-xl rounded-xl md:w-[50%] md:p-10 p-5 m-5">
          <div className="w-full text-2xl font-semibold flex justify-center items-center align-middle ">
            Delete Lab Reports
          </div>
          <div className="border-2 border-black/10 shadow-xl rounded-xl my-5 p-5">
            <div className="pb-5">Enter Lab Report Owner Email</div>
            <div className="flex gap-5">
              <Input
                disabled={isPendingMng}
                value={patientEmailMng}
                onChange={(e) => {
                  setPatientEmailMng(e.target.value);
                }}
                type="email"
                placeholder="Patient Email"
              />
              <Button
                disabled={isPendingMng}
                onClick={searchPatientsByEmailMng}
                className=""
              >
                Search
              </Button>
            </div>
            {patientInfoMng ? (
              <div
                onClick={() =>
                  !isPendingMng
                    ? selectedPatientInfoMng
                      ? (setSelectedPatientInfoMng(null),
                        setReportInfoMng(null))
                      : (setSelectedPatientInfoMng(patientInfoMng),
                        getPatientReports(patientInfoMng.email))
                    : null
                }
                className={` cursor-pointer flex md:w-[80%] border-2 p-2 rounded-xl gap-2  md:gap-10 items-center mt-10 ${
                  selectedPatientInfoMng ? "bg-green-700 text-white" : ""
                }  `}
              >
                <Image
                  src={patientInfoMng.profilePicture || "/user-placeholder.png"}
                  alt="Lab Report Owner"
                  width={50}
                  height={50}
                />
                <div className="flex flex-col">
                  <div className="text-lg font-semibold">
                    {patientInfoMng.name}
                  </div>
                  <div>{patientInfoMng.email}</div>
                </div>
              </div>
            ) : isPendingMng ? (
              <div className="flex md:w-[80%] border-2 p-2 rounded-xl gap-10 items-center mt-10 ">
                <div className="flex text-black/40 gap-5">
                  <Unplug></Unplug>Retrieving patient information...
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
          {selectedPatientInfoMng && reportInfoMng ? (
            <div className="flex flex-col gap-5 mt-5">
              {Array.isArray(reportInfoMng) && reportInfoMng.length > 0 ? (
                reportInfoMng.map((report: any, index: number) => (
                  <div
                    key={index}
                    className="border-2 border-black/10 shadow-xl rounded-xl p-5 hover:shadow-xl hover:shadow-black/30 transition-shadow"
                  >
                    <div className="flex gap-5">
                      <Image
                        className="p-2 border-2 border-blue-600 rounded-xl"
                        src={"/report-img.webp"}
                        alt="Report Preview"
                        width={60}
                        height={60}
                      />
                      <div>
                        <div className="font-bold">{report.title}</div>
                        <div>
                          Uploaded on:{" "}
                          {report.created_at
                            ? new Date(report.created_at).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 text-wrap break-before-auto">
                      {report.description}
                    </div>
                    <div className=" mt-5 flex justify-end  w-full">
                      <Button
                        disabled={isPendingMng}
                        onClick={() => {
                          setReportToDelete(report.id);
                          setShowDeleteDialog(true);
                        }}
                        className=" bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 mt-10">
                  No reports found.
                </div>
              )}
            </div>
          ) : !isPendingMng ? (
            <div className="flex md:w-[80%] border-2 p-2 rounded-xl gap-10 items-center mt-10 ">
              <div className="flex text-black/40 gap-5">
                <Files /> Searched Patient's Reports will Show Here
              </div>
            </div>
          ) : (
            <div className="flex md:w-[80%] border-2 p-2 rounded-xl gap-10 items-center mt-10 ">
              <div className="flex text-black/40 gap-5">
                <FolderSync /> Reports are loading...
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Upload</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to upload this lab report?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => saveToDbFunction(form.getValues())}
            >
              Upload
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lab report? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (reportToDelete) {
                  deleteReport(reportToDelete);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LabReportUploadComp;
