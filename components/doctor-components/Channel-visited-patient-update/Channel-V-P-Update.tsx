"use client";
import React, { useEffect, useState, useTransition } from "react";
import {
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Play,
  Square,
  AlertCircle,
  CheckCircle2,
  Fingerprint,
  Notebook,
  NotebookPen,
  CircleX,
  MousePointerClick,
  UserSearch,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { start } from "repl";
import { Button } from "@/components/ui/button";

export default function ChannelVisitedPatientUpdate({
  channelId,
}: {
  channelId: string;
}) {
  // State for session management
  const [isSessionActive, setIsSessionActive] = useState(false);
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [channelData, setChannelData] = useState<any>(null);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [visitedPatientsNumbers, setVisitedPatientsNumbers] = useState<
    number[]
  >([]);

  // Start Channel Handling Function

  const startChannel = async () => {
    setIsPending(true);
    try {
      const sessionState = await axios.post("/api/change-channel-state-api", {
        channelId: channelId,
        newState: "started",
      });
      if (sessionState.data.success) {
        console.log(sessionState.data);
        console.log("Channel session started successfully");
        setIsSessionActive(true);
      } else {
        console.error(
          "Error starting channel session:",
          sessionState.data.message
        );
      }
    } catch (error) {
      console.error("Error starting channel session:", error);
    } finally {
      setIsPending(false);
    }
  };

  //end channel session handling
  const endChannel = async () => {
    setIsPending(true);
    try {
      const sessionState = await axios.post("/api/change-channel-state-api", {
        channelId: channelId, // Example channel ID,
        newState: "ended",
      });
      if (sessionState.data.success) {
        console.log(sessionState.data);
        console.log("Channel session ended successfully");

        toast.success("Channel session ended successfully");
        router.push("/doctor/doctor-dashboard");
      } else {
        console.error(
          "Error ending channel session:",
          sessionState.data.message
        );
      }
    } catch (error) {
      console.error("Error ending channel session:", error);
    } finally {
      setIsPending(false);
    }
  };

  const getCurrentChannelData = async () => {
    setIsPending(true);
    try {
      const channelData = await axios.post("/api/get-one-channel-deatils-api", {
        channelId: channelId,
      });
      if (channelData.data.data === null) {
        router.push("/doctor/doctor-dashboard");
        console.warn("No channel data found");
      } else if (channelData.data.success) {
        if (channelData.data.data.state === "ended") {
          toast.success("This channel session has ended.");
          router.push("/doctor/doctor-dashboard");
          return;
        }
        setChannelData(channelData.data.data);
        setVisitedPatientsNumbers(channelData.data.data.visitedNumbers || []);
        if (channelData.data.data.state === "started") {
          setIsSessionActive(true);
        }

        console.log("Channel Data:", channelData.data.data);
        // Now fetch doctor data based on the email from channel data
        const doctorData = await axios.post("/api/doctor-details-get-api", {
          email: channelData.data.data.doctorEmail,
        });
        if (doctorData.data.success) {
          console.log("Doctor Data:", doctorData.data.data);
          setDoctorData(doctorData.data.data);
        } else {
          console.error("Error fetching doctor data:", doctorData.data.message);
        }
      } else {
        console.error(
          "Error fetching current channel data:",
          channelData.data.message
        );
        setChannelData(null);
        toast.error("Error fetching current channel data");
      }
    } catch (error) {
      console.error("Error fetching current channel data:", error);
      toast.error("Error fetching current channel data");
      setChannelData(null);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    getCurrentChannelData();
  }, [channelId]);

  const [patientDataLoading, startPatientDataLoading] = useTransition();
  const [patientData, setPatientData] = useState<any>(null);
  const [patientPersonalData, setPatientPersonalData] = useState<any>(null);
  const [attendingMarking, startAttendingMarking] = useTransition();
  const getPatientData = (id: number) => {
    startPatientDataLoading(async () => {
      console.log("Fetching data for patient number:", id);
      console.log("Using channel ID:", channelId);
      const patientInfo = await axios.post("/api/get-channeled-patient-data", {
        patientNumber: id + 1,
        channelId: channelId,
      });
      if (patientInfo.data.success) {
        setPatientData(patientInfo.data.data);
        try {
          const patientPersonalInfo = await axios.post(
            "/api/get-user-by-email-api",
            {
              email: patientInfo.data.data.patientEmail,
            }
          );
          console.log("Patient Info:", patientInfo.data.data);
          if (patientPersonalInfo.data.data === null) {
            toast.error("No patient data found");
            setPatientData(null);
            setPatientPersonalData(null);
            return;
          }
          if (!patientPersonalInfo.data.success) {
            toast.error("Error fetching patient personal info");
            setPatientData(null);
            setPatientPersonalData(null);
            console.log("Error Occured:", patientPersonalInfo.data.data);
          }
          if (patientPersonalInfo.data.success) {
            setPatientPersonalData(patientPersonalInfo.data.data);
            try {
              const updateVisitedSlotsArray = await axios.post(
                "/api/channel-visited-number-upd-api",
                {
                  channelId: channelId,
                  slotNumber: id,
                }
              );
              if (updateVisitedSlotsArray.data.success) {
                toast.success("Patient marked as visited");
                setVisitedPatientsNumbers((prev) => [...prev, id]);
                const markPetientVisited = await axios.post(
                  "/api/set-channeled-patient-attended",
                  {
                    channelId: channelId,
                    patientEmail: patientPersonalInfo.data.data.email,
                  }
                );
                console.log("Visited slots updated successfully");
              } else {
                console.error(
                  "Error updating visited slots:",
                  updateVisitedSlotsArray.data.message
                );
              }
            } catch (e) {
              console.error("Error updating visited slots:", e);
            }
          }
        } catch (e) {
          console.error("Error fetching patient personal info:", e);
          setPatientData(null);
          setPatientPersonalData(null);
          toast.error("Error fetching patient personal info");
        }
      } else {
        toast.error("Error fetching patient info");
        setPatientData(null);
        setPatientPersonalData(null);
      }
    });
  };

  return (
    <div className="h-full bg-slate-50 text-slate-800 font-sans selection:bg-teal-100 selection:text-teal-900 p-4 md:p-4 lg:p-6 overflow-hidden flex flex-col">
      {/* CarePlus Title Top Left */}
      <div className="absolute top-4 left-4 z-20">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 font-bold text-2xl">
          <a href="/">CarePlus</a>
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-[1600px] mt-5 mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 items-stretch pt-8">
        {/* DOCTOR INFO */}
        <div className="lg:col-span-3 flex">
          {doctorData ? (
            <div className="bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative group hover:shadow-2xl transition-all duration-300 w-full flex flex-col">
              {/* Decorative Header */}
              <div className="h-20 bg-gradient-to-br from-teal-600 to-teal-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Stethoscope
                    size={80}
                    className="text-white transform rotate-12 translate-x-4 -translate-y-4"
                  />
                </div>
              </div>

              {/* Avatar */}
              <div className="px-4 relative">
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                  <div className="p-1 bg-white rounded-full shadow-lg">
                    <Image
                      src={
                        doctorData?.profilePicture ||
                        "/doctor-default-avatar.png"
                      }
                      alt="Doctor"
                      height={100}
                      width={100}
                      className="w-20 h-20 rounded-full object-cover border-2 border-slate-50"
                    />
                  </div>
                  <div
                    className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"
                    title="Online"
                  ></div>
                </div>
              </div>

              {/* Info */}
              <div className="pt-12 pb-3 px-3 text-center flex-1 flex flex-col">
                <h2 className="text-lg font-bold text-slate-800 mb-0.5 truncate">
                  {doctorData?.name}
                </h2>
                <p className="text-teal-600 font-medium text-xs mb-2">
                  {doctorData?.specialization}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-1.5 mb-2 text-[10px]">
                  <div className="bg-slate-50 py-1.5 px-2 rounded-lg">
                    <span className="text-slate-400 block">Gender</span>
                    <span className="text-slate-700 font-semibold">
                      {doctorData?.gender}
                    </span>
                  </div>
                  <div className="bg-slate-50 py-1.5 px-2 rounded-lg">
                    <span className="text-slate-400 block">Works At</span>
                    <span className="text-slate-700 font-semibold">
                      {doctorData?.workplace}
                    </span>
                  </div>
                </div>

                <div className="bg-teal-50 py-1.5 px-2 rounded-lg mb-2 text-[10px]">
                  <span className="text-teal-600 font-semibold">
                    {doctorData?.medicalregno}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[10px] bg-slate-50 py-1.5 rounded-lg">
                  <Fingerprint size={10} />
                  <span className="truncate">{doctorData?.bio}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-64 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-slate-200 mb-4" />
              <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-16 bg-slate-100 rounded mb-1" />
              <div className="h-3 w-20 bg-slate-100 rounded" />
              <span className="sr-only">Loading Doctor Info...</span>
            </div>
          )}
        </div>

        {/* CONTROLS  */}
        <div className="lg:col-span-4 flex">
          <div className="bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-5 flex flex-col justify-center items-center relative overflow-hidden w-full">
            {/* Dynamic Background Pulse when Active */}
            <div
              className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
                isSessionActive ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-300 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
            </div>

            <div className="z-10 w-full max-w-xs flex flex-col items-center gap-5">
              {/* Status Indicator */}
              <div className="text-center">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300
                   ${
                     isSessionActive
                       ? "bg-green-100 text-green-700 shadow-lg shadow-green-100 ring-2 ring-green-500/20"
                       : "bg-slate-100 text-slate-400"
                   }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSessionActive
                        ? "bg-green-500 animate-pulse"
                        : "bg-slate-400"
                    }`}
                  ></div>
                  {isSessionActive ? "Session Live" : "Ready to Start"}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                <button
                  onClick={startChannel}
                  disabled={isSessionActive || isPending}
                  className={`group relative w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-base transition-all duration-300 shadow-lg
                    ${
                      isPending
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none scale-95"
                        : isSessionActive
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none scale-95"
                        : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white  hover:-translate-y-1 hover:shadow-xl"
                    }`}
                >
                  <div
                    className={`p-0.5 rounded-full ${
                      isSessionActive ? "bg-slate-200" : "bg-white/20"
                    }`}
                  >
                    <Play
                      size={16}
                      className={
                        isSessionActive ? "text-slate-400" : "fill-current"
                      }
                    />
                  </div>
                  Start Session
                </button>

                <button
                  onClick={endChannel}
                  disabled={!isSessionActive || isPending}
                  className={`group relative w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-base transition-all duration-300 shadow-lg
                    ${
                      isPending
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none scale-95"
                        : !isSessionActive
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none scale-95"
                        : "bg-white border-2 border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200  hover:-translate-y-1 hover:shadow-xl"
                    }`}
                >
                  <div
                    className={`p-0.5 rounded-full ${
                      !isSessionActive ? "bg-slate-200" : "bg-rose-100"
                    }`}
                  >
                    <Square
                      size={16}
                      className={
                        !isSessionActive ? "text-slate-400" : "fill-current"
                      }
                    />
                  </div>
                  End Session
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PATIENT INFO  */}
        {patientDataLoading ? (
          <div className=" flex flex-col justify-center items-center bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 lg:col-span-5">
            {/* Minimalist Spinner */}
            <div className="relative flex items-center justify-center mb-4">
              {/* Background Ring (Subtle structure) */}
              <div className="absolute h-10 w-10 rounded-full border-2 border-slate-100"></div>

              {/* Spinning Indicator (Primary Action) */}
              <Loader2
                size={40}
                className="text-teal-600 animate-spin"
                strokeWidth={1.5} // Thinner stroke looks more modern/minimal
              />
            </div>

            {/* Refined Typography */}
            <h3 className="text-sm font-medium text-slate-600 tracking-wide">
              Retrieving Patient Records
            </h3>

            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">
              Please Wait
            </p>
          </div>
        ) : patientPersonalData && patientData ? (
          <div className="lg:col-span-5 flex">
            <div className="bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-4 md:p-5 relative overflow-hidden w-full">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row gap-4 items-start relative z-10">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-lg shrink-0 border-2 border-white ring-1 ring-slate-100">
                  <img
                    src={patientPersonalData.profilePicture}
                    alt="Patient"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div>
                    <h2 className="text-xl flex gap-5 font-bold text-slate-900">
                      {patientPersonalData.name}
                      <div
                        className={`text-sm border-2 ${
                          patientPersonalData.gender == "male"
                            ? "border-blue-300"
                            : "border-pink-300"
                        } px-3 rounded-xl ${
                          patientPersonalData.gender === "male"
                            ? "bg-blue-200 text-blue-500"
                            : "bg-pink-200 text-pink-500"
                        } ${
                          patientPersonalData.gender === "other"
                            ? "bg-gray-200 text-gray-500 border-gray-300"
                            : ""
                        } font-thin capitalize`}
                      >
                        {patientPersonalData.gender}
                      </div>
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md uppercase tracking-wide">
                        Number : {patientData.patientNumber}
                      </span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-slate-500 text-sm font-medium">
                        {patientPersonalData.age} Years Old
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 mt-2">
                    <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <Phone size={14} className="text-blue-500" />
                      <span className="text-xs font-medium">
                        {patientPersonalData.mobilenumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <Mail size={14} className="text-blue-500" />
                      <span className="text-xs font-medium truncate">
                        {patientPersonalData.email}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => (
                    setPatientData(null), setPatientPersonalData(null)
                  )}
                  variant="ghost"
                  className="border-2 bg-red-200 text-red-500 text-xl hover:bg-red-300 hover:text-red-700 rounded-full p-2 ml-auto shrink-0"
                >
                  <CircleX />
                </Button>
              </div>

              {/* HIGHLIGHTED NOTE CARD */}
              <div className="mt-4">
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 relative overflow-hidden">
                  {/* Accent Bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>

                  <div className="flex items-start gap-3">
                    <div className="bg-white p-1.5 rounded-full shadow-sm text-amber-500 shrink-0">
                      <NotebookPen size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-800 uppercase text-[10px] tracking-wider mb-1">
                        {patientData.patientNote || "No Patient Notes Added"}
                      </h4>
                      <p className="text-slate-700 leading-relaxed text-sm font-medium">
                        {/*{patient.medicalNote}*/}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className=" lg:col-span-5 flex  justify-center items-center bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-5 relative overflow-hidden w-full">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            {/* Content */}
            <div className=" z-10 flex flex-col items-center">
              <div className="group mb-6 relative">
                <div className="  bg-gradient-to-r from-blue-100 to-teal-100 rounded-full blur-lg opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100 relative transform transition-transform duration-300 group-hover:-translate-y-1">
                  <UserSearch
                    size={40}
                    className="text-slate-400 group-hover:text-teal-600 transition-colors duration-300"
                  />
                </div>
                {/* Floating Cursor Icon */}
                <div className="absolute -bottom-4 -right-4 bg-slate-900 text-white p-2 rounded-lg shadow-lg transform rotate-12 animate-bounce">
                  <MousePointerClick size={16} />
                </div>
              </div>

              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-500">
                No Patient Selected
              </h3>
              <p className="text-slate-400 text-sm mt-2 text-center max-w-[200px]">
                Click on any numbered slot to load the patient's dashboard.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SLOTS */}
      <div className="max-w-[1600px] h-full mx-auto w-full flex-1">
        <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 h-full">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-teal-600" />
            <span className="font-bold text-slate-700">Today's Queue</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full ml-2">
              {new Date().toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
              })}
            </span>
          </div>
          {}
          {channelData ? (
            <div className="grid grid-cols-3 md:grid-cols-10 ">
              {Array.from(
                {
                  length: channelData.totalSlots - channelData.remainingSlots,
                },
                (_, index) => (
                  <Button
                    disabled={
                      visitedPatientsNumbers.includes(index) ||
                      patientDataLoading ||
                      !isSessionActive
                    }
                    onClick={() => getPatientData(index)}
                    key={index}
                    className={`
                  relative p-10 mt-8 bg-transparent hover:bg-blue-200 hover:border-blue-600  rounded-lg border-2 transition-all duration-300 cursor-pointer aspect-square flex items-center justify-center
                  ${
                    visitedPatientsNumbers.includes(index)
                      ? "bg-slate-100  border-teal-200 hover:border-teal-300 cursor-not-allowed"
                      : ""
                  }
                `}
                  >
                    {/* Top right indicator */}
                    <div className="absolute top-1 right-1">
                      {!channelData?.visitedNumbers?.includes(index) && (
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      )}
                      {channelData?.visitedNumbers?.includes(index) && (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                      )}
                    </div>

                    {/* Centered number */}
                    <span
                      className={`text-xl font-bold ${
                        visitedPatientsNumbers.includes(index)
                          ? "text-green-600"
                          : "text-slate-600 "
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Button>
                )
              )}
            </div>
          ) : (
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2 animate-pulse">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-slate-100 border border-slate-50"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
