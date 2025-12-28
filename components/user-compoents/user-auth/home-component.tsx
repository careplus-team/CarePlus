"use client";
import { createClient } from "@/lib/supabase/client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "../../ui/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import axios from "axios";
import { toast } from "sonner";
import { CalendarCheck, CalendarCheck2, Users } from "lucide-react";

const HomeComponent = () => {
  const router = useRouter();
  const supabaseClient = createClient();

  // All useState hooks
  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [dbUserInfo, setDbUserInfo] = React.useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [opdSessionData, setOpdSessionData] = useState<any>(null);
  const [issuing, setIssuing] = useState(false);
  const [lastTicket, setLastTicket] = useState<number | null>(null);
  const [upCommingChannelingData, setUpCommingChannelingData] = useState<any[]>(
    []
  );
  const [upDoctorData, setUpDoctorData] = useState<any[]>([]);
  const [isAlreadyBooked, setIsAlreadyBooked] = useState(false);
  const [userBooking, setUserBooking] = useState<any>(null);
  const [alreadyBookingAutoTrigger, setAlreadyBookingAutoTrigger] =
    useState(false);
  const [availableChannelList, setAvailableChannelList] = useState<any[]>([]);
  const [availableChannelListDoctorData, setAvailableChannelListDoctorData] =
    useState<any[]>([]);
  const [opdDoctorData, setOpdDoctorData] = useState<any>(null);

  // All useTransition hooks
  const [isPending, startTransition] = useTransition();
  const [isPendingNotice, startTransitionNotice] = useTransition();
  const [isPendingTips, startTransitionTips] = useTransition();
  const [isPendingOpdSession, startTransitionOpdSession] = useTransition();
  const [isUpcommingChannelingPending, startTransitionUpcommingChanneling] =
    useTransition();
  const [isBookingPending, startBookingTransition] = useTransition();
  const [isPendingAlraedyBooked, startTransitionAlreadyBooked] =
    useTransition();
  const [isAvailableChannelListPending, startChannelListTransition] =
    useTransition();

  // Helper to show initials when profile picture is not available
  const getInitials = (name?: string) => {
    if (!name) return "DS";
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

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

  //get realtime OPD session data

  useEffect(() => {
    //fetch initial OPD session data from DB
    startTransitionOpdSession(async () => {
      const opdSessionInfo = await axios.post("/api/get-opd-session-api");
      console.log("OPD session inspect", opdSessionInfo.data.success);
      if (opdSessionInfo.data.success) {
        setOpdSessionData(opdSessionInfo.data.data[0]);
        console.log("OPD session data", opdSessionInfo.data.data);
      } else {
        toast.error("Error fetching OPD session data");
        return;
      }
    });

    //subscribe for realtime updates
    const channel = supabaseClient
      .channel("realtime:opdsession")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "opdsession" },
        (payload) => {
          console.log("Realtime OPD session update:", payload);
          if (payload.eventType === "UPDATE") {
            setOpdSessionData(payload.new);
          } else if (payload.eventType === "INSERT") {
            setOpdSessionData(payload.new);
          } else if (payload.eventType === "DELETE") {
            setOpdSessionData(null);
          }
          console.log("inspect state", opdSessionData);
          console.log("Realtime update:", payload.new);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  // Fetch doctor details for the active OPD session
  useEffect(() => {
    if (!opdSessionData?.doctorEmail) {
      setOpdDoctorData(null);
      return;
    }

    startTransitionOpdSession(async () => {
      try {
        const doctorResp = await axios.post("/api/doctor-details-get-api", {
          email: opdSessionData.doctorEmail,
        });

        if (doctorResp.data?.success) {
          setOpdDoctorData(doctorResp.data.data);
        } else {
          setOpdDoctorData(null);
        }
      } catch (e) {
        console.error("Error fetching OPD doctor details", e);
        setOpdDoctorData(null);
      }
    });
  }, [opdSessionData]);

  // Fetch upcomming channelings for user
  const fetchUpcommingChannelings = () => {
    startTransitionUpcommingChanneling(async () => {
      if (userInfo?.email == null) {
        return;
      }
      const response = await axios.post(
        "/api/get-user-upcomming-channelings-api",
        {
          patientEmail: userInfo?.email,
        }
      );
      if (response.data.success) {
        console.log("upcomming channelings", response.data.data);
        // Enrich each appointment with channel state and filter out ended channels
        const enriched = await Promise.all(
          (response.data.data || []).map(async (channeling: any) => {
            try {
              const ch = await axios.post("/api/get-one-channel-deatils-api", {
                channelId: channeling.channelId,
              });
              const channelState = ch.data.success ? ch.data.data.state : null;
              return { ...channeling, channelState };
            } catch (e) {
              console.error(
                "Error fetching channel details for appointment",
                e
              );
              return { ...channeling, channelState: null };
            }
          })
        );

        const filtered = enriched.filter(
          (a: any) => a.channelState !== "ended"
        );
        setUpCommingChannelingData(filtered || []);

        // fetch doctor data
        filtered.forEach(async (channeling: any) => {
          const daoctorData = await axios.post("/api/doctor-details-get-api", {
            email: channeling.doctorEmail,
          });
          if (daoctorData.data.success) {
            setUpDoctorData((prev) => [...prev, daoctorData.data.data]);
          } else {
            toast.error("Error fetching doctor data for upcomming channelings");
            return;
          }
        });
      } else {
        setUpCommingChannelingData([]);
        toast.error("Error fetching upcomming channelings");
        return;
      }
      console.log("fetched upcomming channelings", response.data);
    });
  };

  useEffect(() => {
    fetchUpcommingChannelings();

    //add realtime subscription to patient_channeling table
    const channel = supabaseClient
      .channel("realtime:patient_channeling")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patient_channeling" },
        (payload) => {
          console.log("Realtime patient_channeling update:", payload);
          fetchUpcommingChannelings();
        }
      )
      .subscribe();
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [userInfo]);
  const getUserInfoFromDb = (email: any) => {
    startTransition(async () => {
      const client = createClient();
      console.log("used mail", email);
      const dbUserInfo = await client
        .from("user")
        .select("*")
        .eq("email", email);
      if (dbUserInfo.data) {
        if (dbUserInfo.data?.length <= 0) {
          const doctorInfor = await axios.post("/api/doctor-details-get-api", {
            email,
          });
          setDbUserInfo(doctorInfor.data.data);
        } else {
          setDbUserInfo(dbUserInfo.data ? dbUserInfo.data[0] : null);
          console.log(dbUserInfo);
        }
      } else {
        toast.error("Error fetching user data from database");
        return;
      }
    });
  };

  const fetchUserInfoFromAuth = () => {
    startTransition(async () => {
      const client = createClient();
      const { data, error } = await client.auth.getUser();
      console.log("user auth info", data);
      setUserInfo(data.user);

      if (data?.user?.email != null) {
        console.log("hree", data.user.email);
        getUserInfoFromDb(data.user.email);
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

  // Handle OPD Booking
  const opdBookingHandler = () => {
    if (opdSessionData == null) {
      return;
    }
    startBookingTransition(async () => {
      try {
        const response = await axios.post("/api/opd-booking-by-user-api", {
          userEmail: userInfo?.email,
          sessionId: opdSessionData.id,
        });
        if (response.data.success) {
          setAlreadyBookingAutoTrigger(!alreadyBookingAutoTrigger);
          toast.success("OPD slot booked successfully!");
        } else {
          toast.error(response.data.message || "Error booking OPD slot");
        }
      } catch (error) {
        toast.error("Error booking OPD slot");
        return;
      }
    });
  };

  //check is OPD session laready booked
  const checkUserAlreadyBookedOPD = async () => {
    if (userInfo?.email == null || opdSessionData == null) {
      return;
    }
    startTransitionAlreadyBooked(async () => {
      const response = await axios.post("/api/check-already-booked-opd-api", {
        email: userInfo?.email,
      });
      if (response.data.success && response.data.data.length > 0) {
        console.log("already booked data", response.data.data);
        setIsAlreadyBooked(true);
        setUserBooking(response.data.data[0]);
      } else {
        setIsAlreadyBooked(false);
        setUserBooking(null);
      }
    });
  };

  useEffect(() => {
    checkUserAlreadyBookedOPD();
  }, [userInfo, opdSessionData, alreadyBookingAutoTrigger]);

  useEffect(() => {
    if (opdSessionData != null) {
      return;
    }
  });

  //fetch available channel list
  const fetchAvailableChannelList = () => {
    startChannelListTransition(async () => {
      try {
        const channelListResponse = await axios.post(
          "/api/get-channel-list-api"
        );
        if (channelListResponse.data.success) {
          console.log("available channel list", channelListResponse.data.data);
          // Filter out ended channels so they do not appear on the dashboard
          const availableFiltered = (
            channelListResponse.data.data || []
          ).filter((c: any) => c.state !== "ended");
          setAvailableChannelList(availableFiltered);
          availableFiltered.forEach(async (channel: any) => {
            try {
              const channelListDoctorsData = await axios.post(
                "/api/doctor-details-get-api",
                {
                  email: channel.doctorEmail,
                }
              );
              if (channelListDoctorsData.data.success) {
                console.log("avDoc", channelListDoctorsData.data.data);
                setAvailableChannelListDoctorData((prev) => [
                  ...prev,
                  channelListDoctorsData.data.data,
                ]);
              } else {
                toast.error(
                  "Error fetching doctor data for available channel list"
                );
                return;
              }
            } catch (e) {
              console.log(
                "Error fetching doctor data for available channel list",
                e
              );
              toast.error(
                "Error fetching doctor data for available channel list"
              );
              return;
            }
          });
        } else {
          toast.error("Error fetching available channel list");
          return;
        }
      } catch (error) {
        toast.error("Error fetching available channel list");
        return;
      }
    });
  };

  useEffect(() => {
    fetchAvailableChannelList();
    const channel = supabaseClient
      .channel("realtime:availableChannels")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "channel" },
        (payload) => {
          fetchAvailableChannelList();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
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
              <h2 className="text-3xl text-center md:text-left md:text-4xl font-bold mb-2">
                Welcome back,{" "}
                {isPending ? (
                  <span className="inline-block animate-pulse bg-gray-300 h-8 w-24 rounded mx-2"></span>
                ) : (
                  dbUserInfo?.name.toLowerCase()
                )}
                ! 👋
              </h2>
              <p className="text-blue-100 text-lg text-center md:text-left">
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
                  className="rounded-full object-cover aspect-square"
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
              {opdSessionData == null ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <svg
                      className="w-8 h-8 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">
                    No Active Session
                  </h3>
                  <p className="text-slate-500 mt-1 text-sm max-w-xs">
                    The OPD queue is currently closed. Please check again after
                    while .
                  </p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Doctor Info */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center space-x-4 mb-4">
                        {opdDoctorData?.profilePicture ? (
                          <Image
                            src={opdDoctorData.profilePicture}
                            alt={opdDoctorData?.name || "Doctor"}
                            width={64}
                            height={64}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {getInitials(
                              opdDoctorData?.name || opdSessionData?.doctorName
                            )}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {opdDoctorData?.name ||
                              opdSessionData?.doctorName ||
                              "Loading..."}
                          </h4>
                          <p className="text-blue-600 font-medium">
                            {opdDoctorData?.specialization || "Loading..."}
                          </p>
                          <p className="text-sm text-gray-600">
                            {opdDoctorData?.medicalregno
                              ? `Reg: ${opdDoctorData.medicalregno}`
                              : "Reg: N/A"}
                          </p>
                          <p>Notes</p>
                          <p>{opdSessionData?.notes || "Loading..."}</p>
                        </div>
                      </div>
                      <div
                        className={`${
                          opdSessionData?.started
                            ? "border-green-500 text-green-700 bg-green-600/10"
                            : "border-red-500 text-red-700 bg-red-600/10 "
                        } rounded-full border-2 px-4 py-1 inline-block text-sm font-medium `}
                      >
                        Current Status{" "}
                        {opdSessionData?.started
                          ? ": Started"
                          : ": Not Yet Started"}
                      </div>
                    </div>

                    {/* Queue Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-gray-600">Total Seats</span>
                        <span className="font-bold text-blue-600">
                          {opdSessionData?.orginalSlotsCount || "Loading..."}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-gray-600">Current Token</span>
                        <span className="font-bold text-orange-600">
                          {opdSessionData?.numberOfPatientsSlots || "0"}
                        </span>
                      </div>

                      {userBooking ? (
                        <>
                          <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                            <span className="text-gray-600 font-medium">
                              Your Token
                            </span>
                            <span className="font-bold text-indigo-600 text-lg">
                              {userBooking.bookingNumber}
                            </span>
                          </div>

                          <div
                            className={`flex justify-between items-center p-3 rounded-lg border ${
                              Number(opdSessionData?.numberOfPatientsSlots) ===
                              Number(userBooking.bookingNumber)
                                ? "bg-green-50 border-green-200"
                                : Number(
                                    opdSessionData?.numberOfPatientsSlots
                                  ) > Number(userBooking.bookingNumber)
                                ? "bg-red-50 border-red-200"
                                : "bg-purple-50 border-purple-200"
                            }`}
                          >
                            <span className="text-gray-600 font-medium">
                              Status
                            </span>
                            <span
                              className={`font-bold ${
                                Number(
                                  opdSessionData?.numberOfPatientsSlots
                                ) === Number(userBooking.bookingNumber)
                                  ? "text-green-600 animate-pulse"
                                  : Number(
                                      opdSessionData?.numberOfPatientsSlots
                                    ) > Number(userBooking.bookingNumber)
                                  ? "text-red-600"
                                  : "text-purple-600"
                              }`}
                            >
                              {Number(opdSessionData?.numberOfPatientsSlots) ===
                              Number(userBooking.bookingNumber)
                                ? "It's Your Turn!"
                                : Number(
                                    opdSessionData?.numberOfPatientsSlots
                                  ) > Number(userBooking.bookingNumber)
                                ? "Your Turn Passed"
                                : `${
                                    (Number(userBooking.bookingNumber) -
                                      Number(
                                        opdSessionData?.numberOfPatientsSlots
                                      )) *
                                      Number(
                                        opdSessionData?.estimatedTimePerPatient ||
                                          5
                                      ) +
                                    " mins wait"
                                  }`}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-gray-600">
                              Next Available Token
                            </span>
                            <span className="font-bold text-green-600">
                              {(opdSessionData?.lastIssuedToken || 0) + 1}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                            <span className="text-gray-600">
                              Est. Wait Time
                            </span>
                            <span className="font-bold text-purple-600">
                              {((opdSessionData?.lastIssuedToken || 0) +
                                1 -
                                opdSessionData?.numberOfPatientsSlots) *
                                (opdSessionData?.estimatedTimePerPatient || 0) +
                                " minutes" || "Loading..."}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      disabled={
                        isPendingAlraedyBooked ||
                        isAlreadyBooked ||
                        isBookingPending
                      }
                      onClick={opdBookingHandler}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
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
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      {isAlreadyBooked
                        ? "Already Booked"
                        : "Reserve Position" +
                          ((opdSessionData?.lastIssuedToken || 0) + 1)}
                    </Button>
                  </div>
                </div>
              )}
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
                  onClick={() => router.push("/my-lab-reports")}
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
              {isUpcommingChannelingPending ? (
                <div className="p-6">
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl animate-pulse border border-slate-100"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div>
                            <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-40"></div>
                          </div>
                        </div>
                        <div>
                          <div className="h-6 w-20 bg-gray-200 rounded-full mb-2"></div>
                          <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : upCommingChannelingData.length == 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <svg
                      className="w-8 h-8 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">
                    No Upcoming Appointments
                  </h3>
                  <p className="text-slate-500 mt-1 text-sm max-w-xs">
                    You have no upcoming channeling appointments scheduled. Book
                    a new appointment to see it here.
                  </p>
                </div>
              ) : (
                <div className="p-6 max-h-96 overflow-y-scroll scrollbar-mobile">
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {upCommingChannelingData.map((appointment, index) => (
                      <div
                        onClick={() => {
                          if (appointment.channelState === "started") {
                            router.push(
                              `/channel-monitor/${appointment.channelId}`
                            );
                          } else {
                            router.push(
                              `/channel-book/${appointment.channelId}`
                            );
                          }
                        }}
                        key={index}
                        className="flex cursor-pointer items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                            <Image
                              src={
                                upDoctorData.find(
                                  (doc) => doc.email === appointment.doctorEmail
                                )?.profilePicture || "/temp_user.webp"
                              }
                              alt="Doctor"
                              width={40}
                              height={40}
                              className="rounded-full object-cover  aspect-square"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Doctor :{" "}
                              {upDoctorData.find(
                                (doc) => doc.email === appointment.doctorEmail
                              )?.name || "Loading..."}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Speciality :{" "}
                              {upDoctorData.find(
                                (doc) => doc.email === appointment.doctorEmail
                              )?.specialization || "Loading..."}
                            </p>
                            <p className="text-xs text-gray-500">
                              Date & Time : {appointment.channeledDate} •{" "}
                              {appointment.channeledTime}
                            </p>
                          </div>
                        </div>
                        <div>
                          <div
                            className={`px-3 py-1 flex justify-center rounded-full text-xs font-medium ${
                              appointment.channelState === "started"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {appointment.channelState === "started"
                              ? "Ongoing"
                              : "Upcoming"}
                          </div>
                          <div className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-indigo-200">
                            <Users className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-medium text-slate-600">
                              Seat No:{" "}
                              <span className="text-slate-900 font-bold text-base">
                                {appointment.patientNumber}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

              <div className="p-6 max-h-96 overflow-y-scroll scrollbar-mobile">
                <div className="grid gap-4">
                  {isAvailableChannelListPending ? (
                    <div className="p-6">
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl animate-pulse border border-slate-100"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                              <div>
                                <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-40"></div>
                              </div>
                            </div>
                            <div>
                              <div className="h-6 w-20 bg-gray-200 rounded-full mb-2"></div>
                              <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : availableChannelList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <svg
                          className="w-8 h-8 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-slate-900">
                        No Available Appointments
                      </h3>
                      <p className="text-slate-500 mt-1 text-sm max-w-xs">
                        There are no appointments currently available for
                        channeling. Please come back later.
                      </p>
                    </div>
                  ) : (
                    availableChannelList.map((channeling, index) => (
                      <div
                        onClick={() => {
                          if (channeling.remainingSlots <= 0) return;
                          router.push(`/channel-book/${channeling.id}`);
                        }}
                        key={index}
                        className={` ${
                          channeling.remainingSlots <= 0
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        } group bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 `}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              <Image
                                src={
                                  availableChannelListDoctorData.find(
                                    (doc) =>
                                      doc.email === channeling.doctorEmail
                                  )?.profilePicture || "/temp_user.webp"
                                }
                                height={100}
                                width={100}
                                alt="Doctor"
                                className="object-cover aspect-square rounded-full"
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                {availableChannelListDoctorData.find(
                                  (doc) => doc.email === channeling.doctorEmail
                                )?.name || "Loading..."}
                              </h4>
                              <p className="text-sm text-blue-600 font-medium">
                                {availableChannelListDoctorData.find(
                                  (doc) => doc.email === channeling.doctorEmail
                                )?.specialization || "Loading..."}
                              </p>
                              <p className="text-xs text-gray-500">
                                {availableChannelListDoctorData.find(
                                  (doc) => doc.email === channeling.doctorEmail
                                )?.workplace || "Loading..."}
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end space-y-1">
                            <div className="text-lg font-bold text-green-600">
                              {channeling.fee || "Free Channel"} LKR
                            </div>
                            <div
                              className={`text-sm px-2 py-1 w-fit rounded-full font-medium ${
                                channeling.state === "inactive"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {channeling.state || ""}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <CalendarCheck2 className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">
                                {channeling.rating}
                              </span>
                              <span className="text-sm text-gray-500">
                                {channeling.date || ""} at{" "}
                                {channeling.time || ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {channeling.remainingSlots <= 0 ? (
                              <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                Fully Booked
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                              >
                                Book Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                  onClick={() => router.push("/my-lab-reports")}
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
                <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-mobile">
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
