"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  Activity,
  ArrowRight,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";
import axios from "axios";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceStrict } from "date-fns";
import { Button } from "@/components/ui/button";
import LoadingUI from "@/lib/UI-helpers/loading-ui";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Channel = {
  id: number;
  name: string;
  doctorEmail: string;
  date: string;
  time: string;
  totalSlots: number;
  remainingSlots: number;
  currentNumber?: number;
  visitedNumbers?: number[];
  estimateWaitingTime?: number;
  roomNumber?: string | number;
  state?: string;
};

type Booking = {
  id: number;
  patientNumber: number;
  patientEmail: string;
  slotNumber: number;
  state: string;
  channelId: string;
};

export default function ChannelQueueMonitor({
  channelId,
  myBooking,
}: {
  channelId: number;
  myBooking?: Booking | null;
}) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [doctor, setDoctor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isVisited, setIsVisited] = useState(false);

  // Update isVisited state when channel data changes
  useEffect(() => {
    if (channel && myBooking) {
      // Robust accessor for visitedNumbers (handling casing: visitedNumbers vs visitednumbers)
      const rawList = channel.visitedNumbers || (channel as any).visitednumbers || [];
      // Ensure we treat everything as numbers for comparison
      const visitedList = Array.isArray(rawList) ? rawList.map((n: any) => Number(n)) : [];
      const myNumber = Number(myBooking.patientNumber);

      const visited = visitedList.includes(myNumber-1);

      console.log("Monitor Logic Deep Check:", {
        keys: Object.keys(channel),
        rawList,
        visitedList,
        myNumber,
        isVisited: visited,
      });
      
      setIsVisited(visited);
    }
  }, [channel, myBooking]);

  // Handle auto-redirect when visited
  useEffect(() => {
    if (isVisited) {
      router.push("/home");
    }
  }, [isVisited, router]);
  // Fetch initial data
  const fetchInitial = async () => {
    setLoading(true);
    try {
      const ch = await axios.post("/api/get-one-channel-deatils-api", {
        channelId,
      });
      if (ch.data.success) {
        setChannel(ch.data.data);
        const dr = await axios.post("/api/doctor-details-get-api", {
          email: ch.data.data.doctorEmail,
        });
        if (dr.data.success) setDoctor(dr.data.data);
      }
      await axios.post("/api/get-patient-channeling-info/", {
        channelId: channelId,
        patientEmail: null,
      });
      // Note: Passing null returns nothing for now — my booking is fetched via supabase auth on page level and subscribed updates
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, [channelId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!channelId) return;
    const supabase = createClient();

    const channelSub = supabase
      .channel(`public:channel:id=eq.${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "channel",
          filter: `id=eq.${channelId}`,
        },
        (payload) => {
          setChannel((prev: Channel | null) => ({
            ...(prev || {}),
            ...(payload.new as any),
          }));
        }
      )
      .subscribe();

    const bookingSub = supabase
      .channel(`public:patient_channeling:channel=${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "patient_channeling",
          filter: `channelId=eq.${channelId}`,
        },
        (payload) => {
          // if myBooking exists and changed, update; otherwise leave it to page to fetch personal booking
          // For the monitor screen we will not assume logged-in user here — parent page should pass myBooking updates.
          // We'll refresh channel row on insert/delete to update counts if needed
          if (
            payload.eventType === "UPDATE" ||
            payload.eventType === "INSERT" ||
            payload.eventType === "DELETE"
          ) {
            // re-fetch channel to keep consistent
            axios
              .post("/api/get-one-channel-deatils-api", { channelId })
              .then((r) => {
                if (r.data.success) setChannel(r.data.data);
              })
              .catch(console.error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSub);
      supabase.removeChannel(bookingSub);
    };
  }, [channelId]);

  // ETA calculation
  const eta = useMemo(() => {
    if (
      !channel ||
      !myBooking ||
      typeof channel.estimateWaitingTime !== "number"
    )
      return null;

    // Use currentNumber if provided; otherwise fall back to visitedNumbers length
    const visitedLen = channel.visitedNumbers
      ? channel.visitedNumbers.length
      : 0;
    const current = Math.max(channel.currentNumber ?? 0, visitedLen); // effective current position (0-based)

    const myIndex = (myBooking.patientNumber || 1) - 1; // convert to 0-based
    const remaining = myIndex - current;

    if (remaining <= 0) {
      return { minutes: 0, etaString: "Now" };
    }

    const minutes = remaining * (channel.estimateWaitingTime || 0);
    const targetDate = new Date(Date.now() + minutes * 60 * 1000);
    return { minutes, etaString: formatDistanceStrict(new Date(), targetDate) };
  }, [channel, myBooking]);

  if (loading)
    return (
      <div className="p-6">
        <LoadingUI />
      </div>
    );

  const totalBooked =
    (channel?.totalSlots || 0) - (channel?.remainingSlots || 0);
  const visitedCount = channel?.visitedNumbers
    ? channel.visitedNumbers.length
    : 0;
  const progress =
    totalBooked > 0 ? Math.round((visitedCount / totalBooked) * 100) : 0;
  const visitedPreview = channel?.visitedNumbers
    ?.slice(0, 5)
    .map((n: number) => n + 1)
    .join(", ");
  const remainingSlots = Math.max(
    0,
    (channel?.totalSlots || 0) - (channel?.remainingSlots || 0)
  );

  // Helper to determine slot visuals
  const getSlotStyles = (i: any) => {
    const isVisited = (channel?.visitedNumbers || []).includes(i);
    const isCurrent = channel?.currentNumber === i;
    const isMine = !!myBooking && myBooking.patientNumber - 1 === i;

    if (isCurrent)
      return "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105 ring-2 ring-indigo-100 z-10 border-indigo-600";
    if (isMine)
      return "bg-teal-50 text-teal-700 border-teal-200 ring-2 ring-teal-500 ring-offset-2 z-0 font-bold";
    if (isVisited) return "bg-slate-50 text-slate-300 border-slate-100";
    return "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:shadow-sm";
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans">
      {/* --- Main Info Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Live Status (Priority Info) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center relative overflow-hidden order-1 md:order-2 lg:order-2">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 ${
                    channel?.state === "started" ? "" : "hidden"
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    channel?.state === "started"
                      ? "bg-indigo-500"
                      : "bg-slate-400"
                  }`}
                ></span>
              </span>
              {channel?.state === "started" ? "Session Live" : "Not Started"}
            </div>

            <div className="mb-2 text-sm text-slate-500 font-medium uppercase tracking-wide">
              Now Serving Token
            </div>

            <div className="text-7xl font-black text-slate-900 tracking-tighter leading-none mb-2">
              {typeof channel?.currentNumber === "number"
                ? String(channel.currentNumber + 1).padStart(2, "0")
                : "--"}
            </div>

            <div className="text-sm text-slate-400 font-medium">
              {channel?.currentNumber !== undefined
                ? `Room ${channel?.roomNumber || "—"}`
                : "Please Wait"}
            </div>
          </div>
        </div>

        {/* Card 2: Doctor & Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between order-2 md:order-1 lg:order-1">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl  flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0">
              <Image
                src={doctor?.profilePicture || "/default-doctor.png"}
                alt="Doctor"
                width={48}
                height={48}
                className="w-10 h-10 rounded-lg object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {doctor?.name || channel?.doctorEmail || "Doctor"}
              </h3>
              <p className="text-slate-500 text-sm mt-1 font-medium">
                {channel?.name || "General Consultation"}
              </p>

              <div className="flex flex-wrap gap-y-1 gap-x-3 mt-3 text-xs text-slate-500">
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Room {channel?.roomNumber || "—"}
                </div>
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {channel?.date}
                </div>
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {channel?.time}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
              <span>Session Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                style={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
              />
            </div>
            <div className="flex justify-between mt-3">
              <div className="text-center px-4 py-2 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-400 uppercase font-bold">
                  Visited
                </div>
                <div className="text-lg font-bold text-slate-700">
                  {visitedCount}
                </div>
              </div>
              <div className="text-center px-4 py-2 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-400 uppercase font-bold">
                  Total
                </div>
                <div className="text-lg font-bold text-slate-700">
                  {totalBooked}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: My Appointment (Ticket Style) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-md text-white flex flex-col justify-between relative overflow-hidden order-3">
          {/* Decorative Circles for Ticket look */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full"></div>
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full"></div>

          <div>
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-4">
              <Ticket className="w-4 h-4" />
              Your Token
            </div>

            {myBooking ? (
              <div className="space-y-1">
                <div className="text-4xl font-bold text-white">
                  #{String(myBooking.patientNumber).padStart(2, "0")}
                </div>
                <div className="inline-flex items-center gap-2 text-sm text-indigo-200">
                  <Activity className="w-3 h-3" />
                  Status:{" "}
                  <span className="text-white font-medium capitalize">
                    {isVisited ? "Visited" : "Unvisited"}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-xs text-indigo-300">
                    {isVisited ? "Session Status" : "Estimated Wait Time"}
                  </div>
                  <div className="text-xl font-bold text-emerald-400 mt-0.5">
                    {isVisited
                      ? "Completed"
                      : eta
                      ? eta.minutes === 0
                        ? "You're Next!"
                        : `~${eta.minutes} mins`
                      : "Calculating..."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center opacity-80">
                <div className="bg-white/10 p-3 rounded-full mb-3">
                  <User className="w-6 h-6 text-indigo-200" />
                </div>
                <p className="text-sm text-indigo-100">
                  No booking for this session.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <Button
              onClick={() =>
                myBooking &&
                router &&
                router.push(`/channel-book/${myBooking.channelId}`)
              }
              disabled={!myBooking}
              className="w-full bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm"
            >
              {myBooking ? "View Ticket Details" : "Book Now"}
              {myBooking && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>

      {/* --- Slots Grid --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-lg">Queue Status</h3>
          <div className="ml-auto flex gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span className="text-slate-500">Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-200"></span>
              <span className="text-slate-500">Visited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full border border-teal-500 bg-teal-50"></span>
              <span className="text-slate-500">Yours</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          {Array.from({ length: Math.max(0, remainingSlots) }).map((_, i) => {
            const number = i + 1;
            const isMine = !!myBooking && myBooking.patientNumber - 1 === i;
            const isCurrent = channel?.currentNumber === i;

            return (
              <div
                key={i}
                className={`
                  relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-300
                  ${getSlotStyles(i)}
                `}
              >
                <span className="text-lg font-bold leading-none">
                  {String(number).padStart(2, "0")}
                </span>
                {/* Optional: Tiny indicator text for desktop, maybe hide on very small mobile if cluttered */}
                <span className="text-[10px] mt-1 font-medium hidden sm:block">
                  {isCurrent ? "Serving" : isMine ? "You" : ""}
                </span>

                {/* Ping effect for current user */}
                {isCurrent && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
