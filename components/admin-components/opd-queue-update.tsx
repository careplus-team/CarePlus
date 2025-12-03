"use client";
import React, { useState, useEffect, useTransition, use } from "react";
import {
  Users,
  Clock,
  Activity,
  CheckCircle2,
  Save,
  Minus,
  Plus,
  RefreshCw,
  ArrowLeft,
  Stethoscope,
  Play,
  Trash2,
  CircleCheckBig,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import LoadingUI from "@/lib/UI-helpers/loading-ui";
import Image from "next/image";
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
import { createClient } from "@/lib/supabase/client";
import { set } from "zod";
import { Button } from "../ui/button";

// Type definition for the data passed from the previous screen
interface SessionData {
  doctorName: string;
  specialty: string;
  avatar: string;
  timeSlot: string;
  totalCapacity: number;
}

// Default data if none is provided (Fallback)
const defaultSessionData: SessionData = {
  doctorName: "Dr. Sarah Wilson",
  specialty: "Cardiologist",
  avatar: "SW",
  timeSlot: "09:00 AM - 12:00 PM",
  totalCapacity: 40,
};

export default function OPDUpdateQueue() {
  const router = useRouter();
  const supabaseClient = createClient();

  //set loading state for fetch initial data
  const [isPending, startTransition] = useTransition();
  const [isUpdating, startTransitionUpdate] = useTransition();
  const [sessionDataPool, setSessionDataPool] = useState<any>(null);
  const [numberOfSlots, setNumberOfSlots] = useState<string>("Loading...");
  const [updateTrigger, setUpdateTrigger] = useState<boolean>(false);
  const [sessionStarted, setSessionStarted] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string>(
    "doctor-default-avatar.png"
  );

  //get current state of OPD Session from database
  const loadSessionState = () => {
    startTransition(async () => {
      const doctorDetails = await supabaseClient.auth.getUser();
      console.log("Doctor details:", doctorDetails);
      const sessionData = await axios.post("/api/get-opd-session-api");
      const doctorInfoFromDb = await axios.post("/api/doctor-details-get-api", {
        email: doctorDetails.data.user?.email,
      });
      console.log("Doctor info data:", doctorInfoFromDb.data);
      setProfilePhoto(
        doctorInfoFromDb.data.data.profilePicture ||
          "/doctor-default-avatar.png"
      );
      console.log("Fetched session data:", sessionData.data);
      if (
        doctorDetails.data.user?.email !== sessionData.data.data[0]?.doctorEmail
      ) {
        toast.error("You are not authorized to view this session.");
        router.push("/home");
        return;
      }
      if (sessionData.data.data[0].started) {
        setSessionStarted(true);
      } else {
        setSessionStarted(false);
      }

      setSessionDataPool(sessionData.data.data[0]);
      const slots = sessionData.data.data[0].numberOfPatientsSlots;
      setNumberOfSlots(slots !== undefined && slots !== null ? slots : "N/A");
      setInitialLoad(false);
    });
  };

  //load current sate of queue from database
  useEffect(() => {
    loadSessionState();
  }, []);
  //reload session data on update trigger
  useEffect(() => {
    loadSessionState();
  }, [updateTrigger]);

  //update session queue
  const updateQueueState = (action: string) => {
    startTransitionUpdate(async () => {
      if (!sessionDataPool) return;
      if (action !== "decrement" && action !== "increment") return;

      const currentSlots = Number(numberOfSlots);
      const maxSlots = Number(sessionDataPool.orginalSlotsCount);

      if (action === "decrement" && currentSlots >= maxSlots) {
        console.log("No slots available to decrement.");
        toast.error("No slots available to decrement.");
        return;
      }
      if (action === "increment" && currentSlots <= 0) {
        console.log("No slots available to increment.");
        toast.error("No slots available to increment.");
        return;
      }

      if (action === "decrement") {
        try {
          const response = await axios.post(
            "/api/handle-opd-patients-count-api",
            {
              action: "decrement",
            }
          );
          setUpdateTrigger((prev) => !prev);
        } catch (error) {
          console.log("Error decrementing slots:", error);
          toast.error("Error decrementing slots.");
          return;
        }
      }
      if (action === "increment") {
        try {
          const response = await axios.post(
            "/api/handle-opd-patients-count-api",
            {
              action: "increment",
            }
          );
          setUpdateTrigger((prev) => !prev);
        } catch (error) {
          console.log("Error incrementing slots:", error);
          toast.error("Error incrementing slots.");
          return;
        }
      }
    });
  };

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSystemActive, setIsSystemActive] = useState(true);

  // Derived calculations
  const remainingSlots = isNaN(Number(numberOfSlots))
    ? 0
    : Number(numberOfSlots);
  const progressPercentage = Math.min(
    100,
    ((Number(sessionDataPool?.orginalSlotsCount || 1) - Number(numberOfSlots)) /
      Number(sessionDataPool?.orginalSlotsCount || 1)) *
      100
  );

  // Color helpers
  const getRingColor = () => {
    if (progressPercentage < 50) return "text-emerald-500";
    if (progressPercentage < 80) return "text-amber-500";
    return "text-rose-500";
  };

  const [startingSession, setStartingSession] = useState(false);

  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "start" | "end" | "reset";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "start",
    onConfirm: () => {},
  });

  const triggerStartSession = () => {
    setConfirmation({
      isOpen: true,
      title: "Start OPD Session?",
      message:
        "This will make the session active and visible to patients. Are you sure you want to start?",
      type: "start",
      onConfirm: handleStartSession,
    });
  };

  const triggerEndSession = () => {
    setConfirmation({
      isOpen: true,
      title: "End OPD Session?",
      message:
        "This will close the current session. This action cannot be undone. Are you sure?",
      type: "end",
      onConfirm: handleEndSession,
    });
  };

  const triggerResetQueue = () => {
    setConfirmation({
      isOpen: true,
      title: "Reset OPD Queue?",
      message:
        "This will reset the patient count to the original capacity. Current progress will be lost. Are you sure?",
      type: "reset",
      onConfirm: handleResetQueue,
    });
  };

  //handle start session
  const handleStartSession = async () => {
    if (!sessionDataPool || !sessionDataPool.doctorEmail) return;
    try {
      setStartingSession(true);
      const response = await axios.post("/api/start-opd-session-api", {
        doctorEmail: sessionDataPool.doctorEmail,
      });
      console.log("Start session response:", response.data);
      if (response.data.success) {
        toast.success("OPD Session started successfully");
      } else {
        toast.error("Error starting OPD Session: " + response.data.message);
        return;
      }
    } catch (error) {
      toast.error("Error starting OPD Session.");
      return;
    }
    setSessionStarted(true);
  };
  //handle end session
  const handleEndSession = async () => {
    try {
      setInitialLoad(true);
      const endResult = await axios.post("/api/delete-opd-session-api");
      if (endResult.data.success) {
        toast.success("OPD Session ended successfully.");
        router.push("/doctor/doctor-dashboard");
      } else {
        toast.error("Error ending OPD Session: " + endResult.data.message);
        return;
      }
    } catch (e) {
      toast.error("Error ending OPD Session.");
      return;
    }
  };
  //handle reset queue
  const handleResetQueue = async () => {
    if (!sessionDataPool) return;
    try {
      setInitialLoad(true);
      const resetResult = await axios.post("/api/reset-opd-queue-api", {
        orginaPatientSlots: sessionDataPool.orginalSlotsCount,
        doctorEmail: sessionDataPool.doctorEmail,
      });
      if (resetResult.data.success) {
        toast.success("OPD Queue reset successfully.");
        setUpdateTrigger((prev) => !prev);
      } else {
        toast.error("Error resetting OPD Queue: " + resetResult.data.message);
        return;
      }
    } catch (e) {
      toast.error("Error resetting OPD Queue.");
      return;
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50/30 font-sans text-slate-800 relative overflow-hidden flex flex-col items-center justify-center">
      {/* CarePlus Title - Fixed Top Left */}
      <div className=" absolute top-4 left-4 ">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500  to-green-500 font-bold  text-2xl">
          <a href="/">CarePlus</a>
        </p>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-300/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-300/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse delay-1000"></div>
      </div>
      {initialLoad ? (
        <LoadingUI />
      ) : (
        <div className="w-full max-w-4xl relative z-10 animate-in fade-in zoom-in-95 duration-500 px-4">
          {/* Top Navigation Bar */}

          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <button
                onClick={triggerEndSession}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors group"
              >
                <div className="bg-white p-2 rounded-full shadow-sm border border-slate-200 group-hover:border-red-400 group-hover:text-red-600 transition-all">
                  <Trash2 className="w-5 h-5 text-red-300" />
                </div>
                <span className="font-semibold text-sm">End Session</span>
              </button>
              <button
                onClick={triggerStartSession}
                disabled={sessionStarted || startingSession}
                className={`flex items-center gap-2 transition-colors group ${
                  sessionStarted || startingSession
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <div
                  className={`bg-white p-2 rounded-full shadow-sm border transition-all ${
                    sessionStarted || startingSession
                      ? "border-emerald-300 text-emerald-600"
                      : "border-slate-200 group-hover:border-emerald-300 group-hover:text-emerald-600"
                  }`}
                >
                  <Play className="w-5 h-5" />
                </div>
                <span
                  className={`font-semibold text-sm ${
                    sessionStarted
                      ? "text-emerald-600"
                      : "text-slate-500 group-hover:text-slate-800"
                  }`}
                >
                  {startingSession
                    ? "Starting..."
                    : sessionStarted
                    ? "Session Active"
                    : "Start Session"}
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSystemActive
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-slate-300"
                }`}
              ></span>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                {isSystemActive ? "Live Updates On" : "Updates Paused"}
              </span>
            </div>
          </div>

          {/* MAIN DASHBOARD CARD */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 overflow-hidden  rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-200">
                    <Image
                      className=""
                      src={profilePhoto}
                      alt="Doctor Avatar"
                      width={64}
                      height={64}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-current" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {sessionDataPool?.doctorName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                      <Stethoscope className="w-3 h-3" /> <div>OPD Doctor</div>
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3" />{" "}
                      {sessionDataPool?.timeSlot || "Loading..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Controls */}
            <div className="p-8 md:p-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              {/* LEFT: Circular Progress Visualizer */}
              <div className="relative flex-shrink-0">
                <div className="w-72 h-72 md:w-80 md:h-80 relative flex items-center justify-center">
                  {/* Glow Effect */}
                  <div
                    className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-colors duration-700 ${getRingColor().replace(
                      "text-",
                      "bg-"
                    )}`}
                  />

                  {/* SVG Ring */}
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="46%"
                      stroke="currentColor"
                      strokeWidth="20"
                      fill="transparent"
                      className="text-slate-100"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="46%"
                      stroke="currentColor"
                      strokeWidth="20"
                      fill="transparent"
                      strokeDasharray="289%"
                      strokeDashoffset={`${
                        289 * (1 - progressPercentage / 100)
                      }%`}
                      className={`transition-all duration-1000 ease-out ${getRingColor()}`}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Center Data */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Token No
                    </span>
                    <div className="text-8xl md:text-9xl font-bold text-slate-800 tracking-tighter tabular-nums leading-none">
                      {Number(numberOfSlots) === 0
                        ? "Full"
                        : sessionDataPool
                        ? Number(sessionDataPool?.orginalSlotsCount) -
                          Number(numberOfSlots) +
                          1
                        : "--"}
                    </div>
                    <div className="mt-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          remainingSlots > 0 ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      <span className="text-sm font-semibold text-slate-600">
                        {Number(numberOfSlots)} Remaining
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Buttons and Sliders */}
              <div className="flex-1 w-full space-y-8">
                <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-700">
                      Update Queue
                    </h3>
                    <button
                      disabled={isUpdating}
                      onClick={triggerResetQueue}
                      className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full hover:bg-emerald-100 transition-colors"
                    >
                      RESET
                    </button>
                  </div>

                  <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => updateQueueState("decrement")}
                        disabled={
                          !sessionStarted ||
                          Number(numberOfSlots) >=
                            Number(sessionDataPool?.orginalSlotsCount) ||
                          isUpdating
                        }
                        className={`w-20 h-20 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center transition-all shadow-sm ${
                          !sessionStarted ||
                          Number(numberOfSlots) >=
                            Number(sessionDataPool?.orginalSlotsCount) ||
                          isUpdating
                            ? "opacity-50 cursor-not-allowed text-slate-300"
                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 active:scale-95"
                        }`}
                      >
                        <Minus className="w-8 h-8" />
                      </button>

                      <div className="flex-1 h-20 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden">
                        <span className="text-xl font-medium text-slate-500 px-5">
                          OPD
                        </span>
                      </div>

                      <button
                        onClick={() => updateQueueState("increment")}
                        disabled={
                          !sessionStarted ||
                          Number(numberOfSlots) <= 0 ||
                          isUpdating
                        }
                        className={`w-20 h-20 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-200 flex items-center justify-center transition-all ${
                          !sessionStarted ||
                          Number(numberOfSlots) <= 0 ||
                          isUpdating
                            ? "opacity-50 cursor-not-allowed"
                            : "active:scale-95 hover:bg-emerald-700"
                        } disabled:opacity-50`}
                      >
                        <Plus className="w-10 h-10" />
                      </button>
                    </div>
                    <Button
                      className={`${
                        Number(numberOfSlots) === 0 ? "flex" : "hidden"
                      } bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg shadow-green-200 transition-all`}
                      onClick={triggerEndSession}
                    >
                      <CircleCheckBig />
                      End Session
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <AlertDialog
        open={confirmation.isOpen}
        onOpenChange={(isOpen) =>
          setConfirmation((prev) => ({ ...prev, isOpen }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmation.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmation.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                confirmation.onConfirm();
                setConfirmation((prev) => ({ ...prev, isOpen: false }));
              }}
              className={
                confirmation.type === "end" || confirmation.type === "reset"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
