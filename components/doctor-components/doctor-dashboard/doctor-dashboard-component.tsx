"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Eye,
  Play,
  UserCheck,
  TicketIcon,
  ArrowDownLeftFromCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import { toast } from "sonner";
import LoadingUI from "@/lib/UI-helpers/loading-ui";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const DoctorDashboard = () => {
  const client = createClient();
  const router = useRouter();

  const [selected, setSelected] = useState<any>(null);
  const [selectedOpd, setSelectedOpd] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [channelData, setChannelData] = useState<any>([]);
  const [opdSessionData, setOpdSessionData] = useState<any>([]);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);

  const getStatusColor = (status: any) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "inactive":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "inactive":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  //get signed in doctor info from supabase auth
  const getSignedInUserData = () => {
    startTransition(async () => {
      try {
        //fetch doctor data from supabase auth
        const userData = await client.auth.getUser();

        const doctorInfo = await axios.post("/api/doctor-details-get-api", {
          email: userData.data.user?.email,
        });
        console.log("signed in doctor data", doctorInfo);
        setDoctorInfo(doctorInfo.data.data);

        const channelingData = await axios.post("/api/get-doctor-channel-api", {
          email: userData.data.user?.email,
        });
        if (channelingData.data.success) {
          console.log("doctor channel data", channelingData.data.data);
          setChannelData(channelingData.data.data);
        } else {
          toast.error("Error fetching doctor channel data");
          console.log("error fetching doctor channel data");
        }

        const opdSessionData = await axios.post(
          "/api/get-doctor-opd-session-list-api",
          {
            email: userData.data.user?.email,
          }
        );
        if (opdSessionData.data.success) {
          setOpdSessionData(opdSessionData.data.data);
          console.log("doctor opd session data", opdSessionData.data.data);
        } else {
          toast.error("Error fetching doctor opd session data");
          console.log("error fetching doctor opd session data");
        }
      } catch (err) {
        toast.error("Error fetching signed in doctor data");
        console.log("error fetching signed in doctor data", err);
      }
      setInitialLoad(false);
    });
  };

  useEffect(() => {
    getSignedInUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-500 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>

        <div className="relative flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back,{" "}
              {isPending ? (
                <span className="inline-block animate-pulse bg-gray-300 h-8 w-24 rounded mx-2"></span>
              ) : (
                "Dr " + doctorInfo?.name.toLowerCase()
              )}
              ! 👋
            </h2>
            <p className="text-blue-100 text-lg">
              Your stethoscope to the digital world - here’s your clinical
              dashboard.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Image
                src={doctorInfo?.profilePicture || "/temp_user.webp"}
                alt="Profile"
                width={70}
                height={70}
                className="rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      {initialLoad ? (
        <LoadingUI />
      ) : (
        <div>
          {doctorInfo.OPD && opdSessionData.length > 0 ? (
            <div>
              {/* OPD SESSIONS SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border border-5 mb-5 rounded-3xl p-5  shadow-lg bg-white/60 backdrop-blur-sm">
                {/* LEFT SECTION - ASSIGNED CHANNELS */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-3xl shadow-xl border p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">
                      Assigned OPD Sessions
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                      View and manage your OPD sessions
                    </p>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {opdSessionData.map((ch: any) => (
                        <div
                          key={ch.id}
                          className="p-5 bg-white border rounded-2xl shadow-sm hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 text-lg">
                                OPD Session
                              </h3>

                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <TicketIcon className="w-4 h-4" />
                                  <span>
                                    Total Number Of Patient Slots{" "}
                                    {ch.orginalSlotsCount}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{ch.date}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{ch.timeSlot}</span>
                                </div>
                              </div>

                              <p className="text-sm text-gray-500 mt-2">
                                {ch.notes}
                              </p>
                            </div>

                            {/* STATUS + PATIENT COUNT */}
                            <div className="flex flex-col items-end">
                              <div
                                className={`px-3 py-1 text-xs rounded-full border flex items-center space-x-1 ${
                                  ch.started
                                    ? getStatusColor("active")
                                    : getStatusColor("inactive")
                                }`}
                              >
                                <span className="capitalize">
                                  {ch.started ? "active" : "inactive"}
                                </span>
                              </div>
                              {/*I add estimate time per patient insted of number of patients becouse not as normal channels , before start OPD session , patients cannot book slots . */}
                              <p className="text-2xl font-bold text-gray-800 mt-3">
                                {ch.estimatedTimePerPatient} mins
                              </p>
                              <p className="text-xs text-gray-500">
                                per patient
                              </p>

                              {/* VIEW BUTTON */}
                              <button
                                onClick={() => setSelectedOpd(ch as any)}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT SECTION - DETAILS */}
                <div>
                  <div className="bg-white rounded-3xl shadow-xl border p-8 min-h-[400px]">
                    <div className="flex items-center space-x-2 mb-6 justify-between">
                      <div className="flex space-x-2">
                        <Eye className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-800">
                          Channel Details
                        </h3>
                      </div>
                      <Button
                        disabled={!selectedOpd}
                        className="bg-transparent hover:bg-red-100 p-2 rounded-full transition"
                        onClick={() => setSelectedOpd(null)}
                      >
                        <ArrowDownLeftFromCircle className="text-red-500 size-5 font-extrabold" />
                      </Button>
                    </div>

                    {!selectedOpd ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Eye className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="font-semibold text-gray-600">
                          No channel selected
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Click "View" in the assigned list
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm text-gray-500 uppercase font-medium">
                            Channel Name
                          </p>
                          <p className="font-bold text-gray-800 text-lg">
                            OPD Session
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 uppercase font-medium">
                              Number Of Total Ptient Slots
                            </p>
                            <p className="font-semibold text-gray-700 mt-1">
                              {selectedOpd.orginalSlotsCount}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-500 uppercase font-medium">
                              Estimate Time Per Patients
                            </p>
                            <p className="font-semibold text-gray-700 mt-1">
                              {selectedOpd.estimatedTimePerPatient}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 uppercase font-medium">
                            Time Slot
                          </p>
                          <p className="font-semibold text-gray-700 mt-1">
                            {selectedOpd.timeSlot}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 uppercase font-medium">
                            Special Note
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            {selectedOpd.notes || "No Any Special Notes"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-500 uppercase">
                            Status
                          </p>
                          <div
                            className={`inline-flex items-center space-x-2 px-3 py-1 mt-1 rounded-full border ${getStatusColor(
                              selectedOpd.started
                            )}`}
                          >
                            {getStatusIcon(selectedOpd.started)}
                            <span className="capitalize">
                              {selectedOpd.started ? "active" : "inactive"}
                            </span>
                          </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="space-y-3 pt-4 border-t">
                          <Button
                            onClick={() =>
                              router.push("/doctor/opd-queue-update")
                            }
                            className="w-full py-5 flex items-center justify-center space-x-2 px-6  bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                          >
                            <Play className="w-5 h-5" />
                            <span>Start Consultation</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CHANNEL SESSIONS SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border border-5 mb-5 rounded-3xl p-5  shadow-lg bg-white/60 backdrop-blur-sm">
                {/* LEFT SECTION - ASSIGNED CHANNELS */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-3xl shadow-xl border p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">
                      Assigned Channels
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                      View and manage your consultation sessions
                    </p>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {channelData.length > 0 ? (
                        channelData.map((ch: any) => (
                          <div
                            key={ch.id}
                            className="p-5 bg-white border rounded-2xl shadow-sm hover:shadow-md transition"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-800 text-lg">
                                  {ch.name}
                                </h3>

                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>Room {ch.roomNumber}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{ch.date}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{ch.time}</span>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-500 mt-2">
                                  {ch.description}
                                </p>
                              </div>

                              {/* STATUS + PATIENT COUNT */}
                              <div className="flex flex-col items-end">
                                <div
                                  className={`px-3 py-1 text-xs rounded-full border flex items-center space-x-1 ${
                                    ch.state === "active"
                                      ? getStatusColor("active")
                                      : getStatusColor("inactive")
                                  }`}
                                >
                                  <span className="capitalize">{ch.state}</span>
                                </div>

                                <p className="text-2xl font-bold text-gray-800 mt-3">
                                  {ch.totalSlots - ch.remainingSlots}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Patients
                                </p>

                                {/* VIEW BUTTON */}
                                <button
                                  onClick={() => setSelected(ch as any)}
                                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No channels assigned.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT SECTION - DETAILS */}
                <div>
                  <div className="bg-white rounded-3xl shadow-xl border p-8 min-h-[400px]">
                    <div className="flex justify-between items-center space-x-2 mb-6">
                      <div className="flex space-x-2">
                        <Eye className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-800">
                          Channel Details
                        </h3>
                      </div>
                      <Button
                        disabled={!selected}
                        className="bg-transparent hover:bg-red-100 p-2 rounded-full transition"
                        onClick={() => setSelected(null)}
                      >
                        <ArrowDownLeftFromCircle className="text-red-500 size-5 font-extrabold" />
                      </Button>
                    </div>

                    {!selected ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Eye className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="font-semibold text-gray-600">
                          No channel selected
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Click "View" in the assigned list
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm text-gray-500 uppercase font-medium">
                            Channel Name
                          </p>
                          <p className="font-bold text-gray-800 text-lg">
                            {selected.name}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 uppercase font-medium">
                              Room
                            </p>
                            <p className="font-semibold text-gray-700 mt-1">
                              {selected.roomNumber}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-500 uppercase font-medium">
                              Patients
                            </p>
                            <p className="font-semibold text-gray-700 mt-1">
                              {selected.totalSlots - selected.remainingSlots}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 uppercase font-medium">
                            Date & Time
                          </p>
                          <p className="font-semibold text-gray-700 mt-1">
                            {selected.date} • {selected.time}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 uppercase font-medium">
                            Description
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            {selected.description}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-500 uppercase">
                            Status
                          </p>
                          <div
                            className={`inline-flex items-center space-x-2 px-3 py-1 mt-1 rounded-full border ${getStatusColor(
                              selected.state
                            )}`}
                          >
                            {getStatusIcon(selected.state)}
                            <span className="capitalize">{selected.state}</span>
                          </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="space-y-3 pt-4 border-t">
                          <button className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                            <Play className="w-5 h-5" />
                            <span>Start Consultation</span>
                          </button>

                          <div className="">
                            <button className="flex w-full items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">
                              <UserCheck className="w-4 h-4" />
                              <span>Show Patients</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border border-5 mb-5 rounded-3xl p-5  shadow-lg bg-white/60 backdrop-blur-sm">
                {/* LEFT SECTION - ASSIGNED CHANNELS */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-3xl shadow-xl border p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">
                      Assigned Channels
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                      View and manage your consultation sessions
                    </p>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {channelData.length > 0 ? (
                        channelData.map((ch: any) => (
                          <div
                            key={ch.id}
                            className="p-5 bg-white border rounded-2xl shadow-sm hover:shadow-md transition"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-800 text-lg">
                                  {ch.name}
                                </h3>

                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>Room {ch.roomNumber}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{ch.date}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{ch.time}</span>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-500 mt-2">
                                  {ch.description}
                                </p>
                              </div>

                              {/* STATUS + PATIENT COUNT */}
                              <div className="flex flex-col items-end">
                                <div
                                  className={`px-3 py-1 text-xs rounded-full border flex items-center space-x-1 ${
                                    ch.state === "active"
                                      ? getStatusColor("active")
                                      : getStatusColor("inactive")
                                  }`}
                                >
                                  <span className="capitalize">{ch.state}</span>
                                </div>

                                <p className="text-2xl font-bold text-gray-800 mt-3">
                                  {ch.totalSlots - ch.remainingSlots}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Patients
                                </p>

                                {/* VIEW BUTTON */}
                                <button
                                  onClick={() => setSelected(ch as any)}
                                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No channels assigned.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT SECTION - DETAILS */}
                <div>
                  <div className="bg-white rounded-3xl shadow-xl border p-8 min-h-[400px]">
                    <div className="flex justify-between items-center space-x-2 mb-6">
                      <div className="flex space-x-2">
                        <Eye className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-800">
                          Channel Details
                        </h3>
                      </div>
                      <Button
                        disabled={!selected}
                        className="bg-transparent hover:bg-red-100 p-2 rounded-full transition"
                        onClick={() => setSelected(null)}
                      >
                        <ArrowDownLeftFromCircle className="text-red-500 size-5 font-extrabold" />
                      </Button>
                    </div>

                    {!selected ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Eye className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="font-semibold text-gray-600">
                          No channel selected
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Click "View" in the assigned list
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm text-gray-500 uppercase font-medium">
                            Channel Name
                          </p>
                          <p className="font-bold text-gray-800 text-lg">
                            {selected.name}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 uppercase font-medium">
                              Room
                            </p>
                            <p className="font-semibold text-gray-700 mt-1">
                              {selected.roomNumber}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-500 uppercase font-medium">
                              Patients
                            </p>
                            <p className="font-semibold text-gray-700 mt-1">
                              {selected.totalSlots - selected.remainingSlots}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 uppercase font-medium">
                            Date & Time
                          </p>
                          <p className="font-semibold text-gray-700 mt-1">
                            {selected.date} • {selected.time}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 uppercase font-medium">
                            Description
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            {selected.description}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-500 uppercase">
                            Status
                          </p>
                          <div
                            className={`inline-flex items-center space-x-2 px-3 py-1 mt-1 rounded-full border ${getStatusColor(
                              selected.state
                            )}`}
                          >
                            {getStatusIcon(selected.state)}
                            <span className="capitalize">{selected.state}</span>
                          </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="space-y-3 pt-4 border-t">
                          <button className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                            <Play className="w-5 h-5" />
                            <span>Start Consultation</span>
                          </button>

                          <div className="">
                            <button
                               className="flex w-full items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
                               onClick={() =>
                               router.push(`/doctor/PatientList-show?channelId=${selected.id}`)
  }>                           <UserCheck className="w-4 h-4" />
                        <span>Show Patients</span>
                        </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
