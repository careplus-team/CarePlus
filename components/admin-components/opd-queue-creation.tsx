"use client";
import React, { useEffect, useState, useTransition } from "react";
import { Users, Clock, ChevronDown, Stethoscope, Pen } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { set } from "zod";
import Image from "next/image";
import { start } from "node:repl";
import { toast } from "sonner";

const InputGroup = ({
  label,
  children,
  icon: Icon,
}: {
  label: string;
  children: React.ReactNode;
  icon: any;
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
      {Icon && <Icon size={14} className="text-emerald-500" />}
      {label}
    </label>
    {children}
  </div>
);

export default function QueueCreation() {
  // State to hold the list of doctors fetched from the API
  const [doctorList, setDoctorList] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [runOnlyOnce, setRunOnlyOnce] = useState(false);
  const [isPendingForCreation, startCreationTransition] = useTransition();

  const [formData, setFormData] = useState({
    doctorName: "",
    doctorEmail: "",
    timeSlot: "",
    numberOfPatientsSlots: "00",
    estimatedTimePerPatient: "15",
    notes: "",
  });

  // Function to fetch the list of OPD doctors from the API
  const opdDoctorsListFetch = async () => {
    startTransition(async () => {
      const doctorList = await axios.post("/api/doctor-list-get-api", {
        command: "OPD",
      });
      setDoctorList(doctorList.data.data);
      console.log("OPD Doctors List:", doctorList.data.data);
      setIsLoading(false);
    });
  };

  // Fetch the OPD doctors when the component mounts
  useEffect(() => {
    opdDoctorsListFetch();
    console.log("Form data", formData);
  }, []);
  // set initial loading state
  useEffect(() => {
    //prevent multiple calls
    if (runOnlyOnce) return;
    setIsLoading(true);
    setRunOnlyOnce(true);
  });

  // Function to check if there is already an existing OPD session

  const checkAlreadyHaveOpdSession = () => {
    startTransition(async () => {
      try {
        const existingSessions = await axios.post("/api/get-opd-session-api");
        console.log("Existing OPD Sessions:", existingSessions.data.data);
        if (existingSessions.data.data.length > 0) {
          toast.error(
            "An existing OPD session is active. Please end it before creating a new one."
          );
          router.push("/admin/dashboard");
          return;
        }
      } catch (e) {
        console.log("Error checking existing OPD sessions:", e);
      }
    });
  };

  useEffect(() => {
    checkAlreadyHaveOpdSession();
  }, []);

  //API call to create OPD session
  const createOpdSession = () => {
    startCreationTransition(async () => {
      try {
        const creationResults = await axios.post(
          "/api/create-opd-session-api",
          {
            doctorEmail: formData.doctorEmail,
            timeSlot: formData.timeSlot,
            doctorName: formData.doctorName,
            numberOfPatientsSlots: formData.numberOfPatientsSlots,
            estimatedTimePerPatient: formData.estimatedTimePerPatient,
            notes: formData.notes,
          }
        );
        console.log("OPD Session Creation Results:", creationResults);
        if (creationResults.data.success) {
          toast.success("OPD Session created successfully!");
        } else {
          toast.error(
            `Failed to create OPD Session: ${creationResults.data.message}`
          );
        }
      } catch (e) {
        toast.error("Failed to create OPD Session. Please try again.");
        return;
      }
      router.push("/admin/OPD-Q-update");
    });
  };

  // Use the local mock router
  const router = useRouter();

  useEffect(() => {
    console.log("Form data updated:", formData);
  }, [formData]);

  const sessionCreationInprogresswindow = () => {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4 shadow-lg">
          <div className="w-16 h-16 border-4 border-slate-200 rounded-full relative">
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Creating OPD Session...
          </h2>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-indigo-50/30 font-sans text-slate-800 relative overflow-y-auto flex flex-col items-center justify-start md:justify-center py-12 md:py-0">
      {isPendingForCreation && sessionCreationInprogresswindow()}
      {isLoading || isPending ? (
        <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700 h-screen">
          <div className="relative flex items-center justify-center">
            {/* Background Glow */}
            <div className="absolute w-24 h-24 bg-emerald-400/20 rounded-full blur-2xl animate-pulse"></div>

            {/* Spinner Base */}
            <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>

            {/* Spinner Active */}
            <div className="absolute w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>

            {/* Center Icon */}
            <Stethoscope size={24} className="absolute text-emerald-600" />
          </div>

          <div className="flex flex-col items-center gap-1">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              CarePlus
            </h2>
            <p className="text-sm font-medium text-slate-400 animate-pulse">
              Loading resources...
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          {/* CarePlus Title in Top Left */}
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

          <div className="w-full max-w-6xl px-4 sm:px-6 flex flex-col items-center z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-8 md:mt-0">
            <div className="relative w-full max-w-2xl">
              {/* Glowing Border Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-[2rem] blur opacity-20 transition duration-1000 group-hover:opacity-40"></div>

              <div className="relative w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-4 sm:px-8 sm:py-6 border-b border-slate-100/50 flex items-center justify-between bg-gradient-to-r from-slate-50/50 to-white/50">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                      Create OPD Session
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Manage doctor availability and patient slots
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-100">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    System Active
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <InputGroup label="Select Doctor" icon={Stethoscope}>
                        <div className="relative group">
                          <select
                            className="w-full appearance-none bg-slate-50 hover:bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3 pr-10 transition-all outline-none cursor-pointer"
                            value={formData.doctorEmail}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                doctorEmail: e.target.value,
                                doctorName: doctorList.find(
                                  (d) => d.email === e.target.value
                                )?.name,
                              })
                            }
                          >
                            <option value="" disabled>
                              Choose a OPD Doctor...
                            </option>
                            {doctorList.map((doc) => (
                              <option key={doc.email} value={doc.email}>
                                {doc.name} — {doc.specialization}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                          />
                        </div>
                      </InputGroup>

                      {/* Doctor Card Preview */}
                      <div
                        className={`p-4 rounded-xl border  border-slate-100 bg-white/50 transition-all duration-300 ${
                          formData.doctorEmail
                            ? "opacity-100 translate-y-0"
                            : "opacity-50 grayscale translate-y-2"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                            <Image
                              className="rounded-full"
                              alt="Doctor Default Avatar"
                              width={100}
                              height={100}
                              src={
                                formData.doctorEmail
                                  ? doctorList.find(
                                      (d) => d.email === formData.doctorEmail
                                    )?.profilePicture
                                  : "/doctor-default-avatar.png"
                              }
                            />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-700 truncate">
                              {formData.doctorEmail
                                ? doctorList.find(
                                    (d) => d.email === formData.doctorEmail
                                  )?.name
                                : "No Doctor Selected"}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {formData.doctorEmail
                                ? doctorList.find(
                                    (d) => d.email === formData.doctorEmail
                                  )?.specialization
                                : "Please select a doctor"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <InputGroup label="OPD Session Notes" icon={Pen}>
                        <div className="relative">
                          <textarea
                            className="w-full bg-slate-50 hover:bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3 pt-3.5 transition-all outline-none font-semibold resize-none h-24"
                            placeholder="Additional notes for the OPD session (optional)..."
                            value={formData.notes}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                notes: e.target.value,
                              })
                            }
                          />
                        </div>
                      </InputGroup>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <InputGroup label="Select Time Slot" icon={Clock}>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1 group">
                            <input
                              type="time"
                              className="w-full bg-slate-50 hover:bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3 transition-all outline-none cursor-pointer"
                              onChange={(e) => {
                                // Update only the start time while preserving the end time
                                //this extract the end time (all after the " - ") and keeps it unchanged while updating the start time
                                const currentEnd =
                                  formData.timeSlot.split(" - ")[1] || "";
                                setFormData({
                                  ...formData,
                                  timeSlot: `${e.target.value} - ${currentEnd}`,
                                });
                              }}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                              Start
                            </span>
                          </div>
                          <span className="text-slate-400 font-medium">-</span>
                          <div className="relative flex-1 group">
                            <input
                              type="time"
                              className="w-full bg-slate-50 hover:bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3 transition-all outline-none cursor-pointer"
                              onChange={(e) => {
                                // Update only the end time while preserving the start time
                                //this extract the start time (all before the " - ") and keeps it unchanged while updating the end time
                                const currentStart =
                                  formData.timeSlot.split(" - ")[0] || "";
                                setFormData({
                                  ...formData,
                                  timeSlot: `${currentStart} - ${e.target.value}`,
                                });
                              }}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                              End
                            </span>
                          </div>
                        </div>
                      </InputGroup>

                      <InputGroup label="Assignable Slots" icon={Users}>
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full bg-slate-50 hover:bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3 pl-4 transition-all outline-none font-semibold"
                            value={formData.numberOfPatientsSlots}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                numberOfPatientsSlots: e.target.value,
                              })
                            }
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                            Patients
                          </div>
                        </div>
                      </InputGroup>

                      <InputGroup
                        label="Estimated Time Per Patient (minutes)"
                        icon={Clock}
                      >
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full bg-slate-50 hover:bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3 pl-4 transition-all outline-none font-semibold"
                            value={formData.estimatedTimePerPatient}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                estimatedTimePerPatient: e.target.value,
                              })
                            }
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                            Minutes
                          </div>
                        </div>
                      </InputGroup>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                    <button className="w-full sm:w-auto px-6 border-2 py-3 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all">
                      Cancel
                    </button>
                    <button
                      onClick={createOpdSession}
                      disabled={
                        isLoading ||
                        !formData.doctorEmail ||
                        formData.timeSlot == "" ||
                        formData.numberOfPatientsSlots == "00"
                      }
                      className={`
                    w-full sm:w-fit overflow-hidden px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all active:scale-95
                    ${
                      isLoading
                        ? "sm:w-40 bg-emerald-600 cursor-wait"
                        : "sm:w-32 bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                    }
                    ${
                      (!formData.doctorEmail && !isLoading) ||
                      formData.timeSlot == "" ||
                      formData.numberOfPatientsSlots == "00" ||
                      formData.numberOfPatientsSlots == "0" ||
                      formData.numberOfPatientsSlots == "" ||
                      formData.numberOfPatientsSlots < "0"
                        ? "opacity-50 cursor-not-allowed"
                        : "opacity-100"
                    }
                  `}
                    >
                      <span
                        className={`flex items-center justify-center gap-2 ${
                          isLoading ? "opacity-0" : "opacity-100"
                        }`}
                      >
                        Create OPD Session
                      </span>
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Bottom Strip */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
