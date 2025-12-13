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
import { set } from "zod";

const ActiveSessionComponent = () => {
  const supabaseClient = createClient();
  const router = useRouter();

  const [selected, setSelected] = useState<any>(null);
  const [selectedOpd, setSelectedOpd] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [channelData, setChannelData] = useState<any>([]);
  const [opdSessionData, setOpdSessionData] = useState<any>([]);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

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
        const channelingData = await axios.post("/api/get-channel-list-api");
        if (channelingData.data.success) {
          console.log("doctor channel data", channelingData.data.data);
          setChannelData(channelingData.data.data);
        } else {
          toast.error("Error fetching doctor channel data");
          console.log("error fetching doctor channel data");
        }

        const opdSessionData = await axios.post("/api/get-opd-session-api");
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
    //subscribe for realtime updates
    const channel = supabaseClient
      .channel("realtime:opdsession-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "opdsession" },
        (payload) => {
          console.log("Realtime OPD session update:", payload);
          if (payload.eventType === "INSERT") {
            setOpdSessionData([payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setOpdSessionData([payload.new]);
          } else if (payload.eventType === "DELETE") {
            setOpdSessionData([]);
          }
        }
      )
      .subscribe();

    const channelTwo = supabaseClient
      .channel("realtime:channel-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "channel" },
        (payload) => {
          console.log("Realtime channel update:", payload);
          if (payload.eventType === "INSERT") {
            setChannelData((prev: any[]) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setChannelData((prev: any[]) =>
              prev.map((ch: any) =>
                ch.id === payload.new.id ? payload.new : ch
              )
            );
          } else if (payload.eventType === "DELETE") {
            setChannelData((prev: any[]) =>
              prev.filter((c: any) => c.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
      supabaseClient.removeChannel(channelTwo);
    };
  }, []);

  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "start" | "end" | "reset" | "endChannel";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "start",
    onConfirm: () => {},
  });

  const triggerEndSession = () => {
    console.log("trigger end session");
    setConfirmation({
      isOpen: true,
      title: "End OPD Session?",
      message:
        "This will close the current session. This action cannot be undone. Are you sure?",
      type: "end",
      onConfirm: handleEndSession,
    });
  };

  // trigger confirm dialog to end a specific channel
  const triggerEndChannel = (channelId: string) => {
    console.log("trigger end channel", channelId);
    setConfirmation({
      isOpen: true,
      title: "End Channel?",
      message:
        "This will close the selected channel. This action cannot be undone. Are you sure?",
      type: "endChannel",
      onConfirm: () => endChannelSession(channelId),
    });
  };

  //handle end session
  const handleEndSession = async () => {
    try {
      setInitialLoad(true);
      const endResult = await axios.post("/api/delete-opd-session-api");
      if (endResult.data.success) {
        toast.success("OPD Session ended successfully.");
        // optimistic UI update: clear local session data and selection
        setOpdSessionData([]);
        setSelectedOpd(null);
      } else {
        toast.error("Error ending OPD Session: " + endResult.data.message);
        return;
      }
    } catch (e) {
      toast.error("Error ending OPD Session.");
      return;
    } finally {
      setInitialLoad(false);
    }
  };

  //end Non-OPD channel sessions
  const endChannelSession = async (channelId: string) => {
    try {
      setInitialLoad(true);
      const endResult = await axios.post("/api/end-channel-api", { channelId });
      if (endResult.data.success) {
        toast.success("Channel ended successfully.");
        // optimistic UI update: remove channel from local state and clear selection
        setChannelData((prev: any[]) =>
          prev.filter((c: any) => c.id !== channelId)
        );
        if (selected && selected.id === channelId) setSelected(null);
      } else {
        toast.error("Error ending channel: " + endResult.data.message);
        return;
      }
    } catch (e) {
      toast.error("Error ending channel.");
      return;
    } finally {
      setInitialLoad(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className=" absolute top-4 left-4 ">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500  to-green-500 font-bold  text-2xl">
          <a href="/">CarePlus</a>
        </p>
      </div>

      <div className="mb-8 mt-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Active Sessions
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor and manage all currently active OPD and Channel sessions.
          </p>
        </div>
      </div>
      {initialLoad ? (
        <LoadingUI />
      ) : (
        <div>
          {opdSessionData.length > 0 ? (
            <div>
              {/* OPD SESSIONS SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border border-5 mb-5 rounded-3xl p-5  shadow-lg bg-white/60 backdrop-blur-sm">
                {/* LEFT SECTION - CURRENT CHANNELS */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-3xl shadow-xl border p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">
                      Current OPD Sessions
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                      View and OPD sessions Status
                    </p>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {opdSessionData.map((ch: any) => (
                        <div
                          key={ch.id}
                          className="p-5 bg-white border rounded-2xl shadow-sm hover:shadow-md transition"
                        >
                          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                            <div className="flex-1 w-full">
                              <h3 className="font-bold text-gray-800 text-lg">
                                OPD Session
                              </h3>

                              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <TicketIcon className="w-4 h-4" />
                                  <span>
                                    Total Slots: {ch.orginalSlotsCount}
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
                            <div className="flex flex-col md:flex-col items-center md:items-end justify-between w-full md:w-auto mt-2 md:mt-0 gap-4">
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
                              <div className="flex gap-10">
                                <div className="text-right">
                                  <p className="text-xl md:text-2xl font-bold text-gray-800 mt-0 md:mt-3">
                                    {ch.estimatedTimePerPatient} mins
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    per patient
                                  </p>
                                </div>

                                {/* VIEW BUTTON */}
                                <button
                                  onClick={() => setSelectedOpd(ch as any)}
                                  className="md:mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                                >
                                  View
                                </button>
                              </div>
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
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm text-gray-500 uppercase font-medium">
                              Channel Name
                            </p>
                            <p className="font-bold text-gray-800 text-lg">
                              OPD Session
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="text-sm text-gray-500 uppercase font-medium">
                              Currently Available Number
                            </p>
                            <p className="font-semibold text-gray-700 mt-1">
                              {selectedOpd.lastIssuedToken + 1}
                            </p>
                          </div>
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
                            onClick={triggerEndSession}
                            className="w-full py-5 flex items-center justify-center space-x-2 px-6  bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
                          >
                            <Play className="w-5 h-5" />
                            <span>End Session</span>
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
                      Currently Available Channels
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                      View and manage currently available channel sessions
                    </p>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {channelData.length > 0 ? (
                        channelData.map((ch: any) => (
                          <div
                            key={ch.id}
                            className="p-5 bg-white border rounded-2xl shadow-sm hover:shadow-md transition"
                          >
                            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                              <div className="flex-1 w-full">
                                <h3 className="font-bold text-gray-800 text-lg">
                                  {ch.name}
                                </h3>

                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
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
                              <div className="flex flex-col md:flex-col items-center md:items-end justify-between w-full md:w-auto mt-2 md:mt-0 gap-4">
                                <div
                                  className={`px-3 py-1 text-xs rounded-full border flex items-center space-x-1 ${
                                    ch.state === "active"
                                      ? getStatusColor("active")
                                      : getStatusColor("inactive")
                                  }`}
                                >
                                  <span className="capitalize">{ch.state}</span>
                                </div>
                                <div className="flex gap-10">
                                  <div className="text-right">
                                    <p className="text-xl md:text-2xl font-bold text-gray-800 mt-0 md:mt-3">
                                      {ch.totalSlots - ch.remainingSlots}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Patients
                                    </p>
                                  </div>

                                  {/* VIEW BUTTON */}
                                  <button
                                    onClick={() => setSelected(ch as any)}
                                    className="md:mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No channels available.</p>
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
                          <div className="">
                            <button
                              onClick={() => triggerEndChannel(selected.id)}
                              className="flex w-full items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>End Channel</span>
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
                      Currently Available Channels
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                      View and manage currently available channel sessions
                    </p>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {channelData.length > 0 ? (
                        channelData.map((ch: any) => (
                          <div
                            key={ch.id}
                            className="p-5 bg-white border rounded-2xl shadow-sm hover:shadow-md transition"
                          >
                            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                              <div className="flex-1 w-full">
                                <h3 className="font-bold text-gray-800 text-lg">
                                  {ch.name}
                                </h3>

                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
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
                              <div className="flex flex-col md:flex-col items-center md:items-end justify-between w-full md:w-auto mt-2 md:mt-0 gap-4">
                                <div
                                  className={`px-3 py-1 text-xs rounded-full border flex items-center space-x-1 ${
                                    ch.state === "active"
                                      ? getStatusColor("active")
                                      : getStatusColor("inactive")
                                  }`}
                                >
                                  <span className="capitalize">{ch.state}</span>
                                </div>
                                <div className="flex gap-10">
                                  <div className="text-right">
                                    <p className="text-xl md:text-2xl font-bold text-gray-800 mt-0 md:mt-3">
                                      {ch.totalSlots - ch.remainingSlots}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Patients
                                    </p>
                                  </div>

                                  {/* VIEW BUTTON */}
                                  <button
                                    onClick={() => setSelected(ch as any)}
                                    className="md:mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                                  >
                                    View
                                  </button>
                                </div>
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
                          <div className="">
                            <button
                              onClick={() => triggerEndChannel(selected.id)}
                              className="flex w-full items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>End Channel</span>
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
                confirmation.type === "end" ||
                confirmation.type === "reset" ||
                confirmation.type === "endChannel"
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
};

export default ActiveSessionComponent;
