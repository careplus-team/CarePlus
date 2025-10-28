"use client";
import { createClient } from "@/lib/supabase/client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { start } from "node:repl";
import axios from "axios";
import { toast } from "sonner";

const HomeComponent = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [dbUserInfo, setDbUserInfo] = React.useState<any>(null);

  const [isPendingNotice, startTransitionNotice] = useTransition();

  const [notices, setNotices] = useState<any[]>([]);

  const supabaseClient = createClient();

  const [tips, setTips] = useState<any[]>([]);
  const [isPendingTips, startTransitionTips] = useTransition();

  useEffect(() => {
    // 1. Fetch initial notices

    startTransitionNotice(async () => {
      const noticeData = await axios.get("/api/notice-get-api");
      if (noticeData.data.success) {
        setNotices(noticeData.data.data || []);
      } else {
        toast.error("Error fetching notices");
        return;
      }
    });

    // 2. Subscribe for realtime updates
    const channel = supabaseClient
      .channel("realtime:notice")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notice" },
        (payload) => {
          console.log("Realtime update:", payload);

          if (payload.eventType === "INSERT") {
            setNotices((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setNotices((prev) => prev.filter((n) => n.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setNotices((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            );
          }
        }
      )
      .subscribe();

    // 3. Cleanup on unmount
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // 1. Fetch initial tips

    startTransitionTips(async () => {
      const tipsData = await axios.get("/api/health-tip-get-api");
      if (tipsData.data.success) {
        setTips(tipsData.data.data || []);
      } else {
        toast.error("Error fetching tips");
        return;
      }
    });

    // 2. Subscribe for realtime updates
    const channel = supabaseClient
      .channel("realtime:notice")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "healthtip" },
        (payload) => {
          console.log("Realtime update:", payload);

          if (payload.eventType === "INSERT") {
            setTips((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setTips((prev) => prev.filter((n) => n.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setTips((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            );
          }
        }
      )
      .subscribe();

    // 3. Cleanup on unmount
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  const getUserInfoFromDb = (email: any) => {
    startTransition(async () => {
      const client = createClient();
      console.log("used mail", email);
      const dbUserInfo = await client
        .from("user")
        .select("*")
        .eq("email", email);
      setDbUserInfo(dbUserInfo.data ? dbUserInfo.data[0] : null);
      console.log(dbUserInfo);
    });
  };

  const fetchUserInfoFromAuth = () => {
    startTransition(async () => {
      const client = createClient();
      const userAuthInfo = await client.auth.getClaims();
      setUserInfo(userAuthInfo);
      console.log("haree1");
      if (userAuthInfo?.data?.claims?.email != null) {
        console.log("hree", userAuthInfo?.data?.claims?.email);
        getUserInfoFromDb(userAuthInfo?.data?.claims?.email);
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      const client = createClient();
      const { error } = await client.auth.signOut();
      if (!error) {
        router.push("/login");
      }
    });
  };

  useEffect(() => {
    fetchUserInfoFromAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
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
                  dbUserInfo?.name.toLowerCase()
                )}
                ! 👋
              </h2>
              <p className="text-blue-100 text-lg">
                Your health journey continues. Here's your personalized
                dashboard.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Image
                  src={dbUserInfo?.profilePicture || "/temp_user.webp"}
                  alt="Profile"
                  width={70}
                  height={70}
                  className="rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Queue Status & Appointments */}
          <div className="lg:col-span-2 space-y-8">
            {/* OPD Queue Status */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">OPD Real-Time Queue</h3>
                    <p className="text-emerald-100">
                      Live queue status and booking
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Doctor Info */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        DS
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          Dr. Sutharan
                        </h4>
                        <p className="text-blue-600 font-medium">Cardiology</p>
                        <p className="text-sm text-gray-600">
                          MBBS • Reg: 123456
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Queue Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-600">Total Seats</span>
                      <span className="font-bold text-blue-600">100</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-gray-600">Current Queue</span>
                      <span className="font-bold text-orange-600">45</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-600">Available Position</span>
                      <span className="font-bold text-green-600">85</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-gray-600">Est. Wait Time</span>
                      <span className="font-bold text-purple-600">30 mins</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Reserve Position #85
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions Mobile */}
            <div className="bg-white rounded-2xl block md:hidden shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
                <p className="text-red-100">Emergency and essential services</p>
              </div>

              <div className="p-6 space-y-4">
                <Button className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Emergency Call
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold py-4 rounded-xl hover:border-blue-300"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  View Lab Reports
                </Button>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Upcoming Appointments</h3>
                    <p className="text-violet-100">
                      Your scheduled consultations
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {[
                    {
                      doctor: "Dr. Sutharan",
                      specialty: "Cardiology",
                      date: "20th Oct 2023",
                      time: "10:00 AM",
                      status: "confirmed",
                    },
                    {
                      doctor: "Dr. Priya",
                      specialty: "Dermatology",
                      date: "22nd Oct 2023",
                      time: "2:30 PM",
                      status: "pending",
                    },
                    {
                      doctor: "Dr. Kumar",
                      specialty: "Orthopedics",
                      date: "25th Oct 2023",
                      time: "11:15 AM",
                      status: "confirmed",
                    },
                    {
                      doctor: "Dr. Silva",
                      specialty: "Neurology",
                      date: "28th Oct 2023",
                      time: "9:00 AM",
                      status: "confirmed",
                    },
                  ].map((appointment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                          {appointment.doctor.split(" ")[1][0]}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {appointment.doctor}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {appointment.specialty}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.date} • {appointment.time}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {appointment.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Latest Channelings - Promotional */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/10 rounded-full"></div>

                <div className="relative flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Latest Channelings</h3>
                    <p className="text-rose-100">
                      Featured specialist consultations
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-4">
                  {[
                    {
                      doctor: "Dr. Sarah Johnson",
                      specialty: "Neurology",
                      experience: "15+ years",
                      rating: 4.9,
                      reviews: 234,
                      fee: "Rs. 3,500",
                      availability: "Available Today",
                      image: "SJ",
                      highlight: "Brain & Nerve Specialist",
                    },
                    {
                      doctor: "Dr. Michael Chen",
                      specialty: "Cardiology",
                      experience: "12+ years",
                      rating: 4.8,
                      reviews: 189,
                      fee: "Rs. 4,200",
                      availability: "Tomorrow",
                      image: "MC",
                      highlight: "Heart Health Expert",
                    },
                    {
                      doctor: "Dr. Priya Sharma",
                      specialty: "Dermatology",
                      experience: "10+ years",
                      rating: 4.7,
                      reviews: 156,
                      fee: "Rs. 2,800",
                      availability: "This Week",
                      image: "PS",
                      highlight: "Skin & Beauty Care",
                    },
                  ].map((channeling, index) => (
                    <div
                      key={index}
                      className="group bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {channeling.image}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {channeling.doctor}
                            </h4>
                            <p className="text-sm text-blue-600 font-medium">
                              {channeling.specialty}
                            </p>
                            <p className="text-xs text-gray-500">
                              {channeling.experience} experience
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {channeling.fee}
                          </div>
                          <div
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              channeling.availability === "Available Today"
                                ? "bg-green-100 text-green-700"
                                : channeling.availability === "Tomorrow"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {channeling.availability}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <svg
                              className="w-4 h-4 text-yellow-400 fill-current"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">
                              {channeling.rating}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({channeling.reviews} reviews)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                            {channeling.highlight}
                          </span>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    className="border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-semibold px-6 py-3 rounded-xl"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    View All Channelings
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl hidden md:flex shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
                <p className="text-red-100">Emergency and essential services</p>
              </div>

              <div className="p-6 space-y-4 flex flex-col justify-center w-full">
                <Button className="w-full h-[30%] bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Emergency Call
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-[30%] border-2 border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold py-4 rounded-xl hover:border-blue-300"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  View Lab Reports
                </Button>
              </div>
            </div>

            {/* Health Notices */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden md:min-h-[400px]">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Important Notices</h3>
                <p className="text-amber-100">
                  Stay informed about hospital updates
                </p>
              </div>

              <div className="p-6 h-full">
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {isPendingNotice ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-50 rounded-xl border-l-4 border-l-amber-400 animate-pulse"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-5 bg-gray-300 rounded w-16"></div>
                          </div>
                          <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    notices.map((notice, index) => (
                      <div
                        key={index}
                        className="p-4 bg-slate-50 rounded-xl border-l-4 border-l-amber-400"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {notice.title}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notice.piority === "high"
                                ? "bg-red-100 text-red-700"
                                : notice.piority === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {notice.piority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notice.content}
                        </p>
                        <p className="text-xs text-gray-500">{notice.date}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Health Tips */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden md:min-h-[400px]">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Daily Health Tips</h3>
                <p className="text-green-100">Tips for a healthier lifestyle</p>
              </div>

              <div className="p-6 h-full">
                <div className="space-y-4">
                  {isPendingTips ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg animate-pulse"
                        >
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <div className="w-4 h-4 bg-gray-300 rounded"></div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-full"></div>
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    tips.map((tip, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-700">{tip.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeComponent;
