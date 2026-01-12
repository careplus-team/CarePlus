"use client";

import React, { useEffect, useState, useTransition } from "react";
import axios from "axios";
import {
  Users,
  Activity,
  CalendarCheck,
  FileText,
  UserPlus,
  ShieldAlert,
  Megaphone,
  UserCog,
  Stethoscope,
  TestTube2,
  ListTodo,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QueueCreation from "@/components/admin-components/opd-queue-creation";
import IssueTicketComponent from "@/components/admin-components/ticket-issue-component";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminDashboardComp() {
  const [hasActiveSession, setHasActiveSession] = useState<boolean | null>(
    null
  );
  const [showOpd, setShowOpd] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [dbUserInfo, setDbUserInfo] = useState<any>(null);
  const router = useRouter();

  // Fetch User Info
  useEffect(() => {
    const fetchUserInfo = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        // fetching from user table
        const { data: userData, error } = await supabase
          .from("user")
          .select("*")
          .eq("email", user.email)
          .single();

        if (userData) {
          setDbUserInfo(userData);
        } else {
          router.push("/login");
        }
      }
    };
    fetchUserInfo();
  }, []);

  const checkActiveSession = () => {
    startTransition(async () => {
      try {
        const response = await axios.post("/api/get-opd-session-api");
        if (
          response.data.success &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          setHasActiveSession(true);
        } else {
          setHasActiveSession(false);
        }
      } catch (error) {
        console.error("Failed to check active sessions", error);
        setHasActiveSession(false);
      }
    });
  };

  useEffect(() => {
    checkActiveSession();

    const supabase = createClient();
    const channel = supabase
      .channel("opdsession-dashboard-status")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "opdsession" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setHasActiveSession(true);
          } else if (payload.eventType === "DELETE") {
            setHasActiveSession(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const QuickAccessCard = ({
    title,
    icon: Icon,
    href,
    colorClass,
  }: {
    title: string;
    icon: any;
    href: string;
    colorClass: string;
  }) => (
    <Link href={href} className="group">
      <Card className="h-full border-2 border-transparent hover:border-slate-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}
          >
            <Icon className={`w-7 h-7 ${colorClass.replace("bg-", "text-")}`} />
          </div>
          <h3 className="font-semibold text-slate-700 group-hover:text-slate-900">
            {title}
          </h3>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back,{" "}
              {!dbUserInfo ? (
                <span className="inline-block animate-pulse bg-gray-500/50 h-8 w-32 rounded mx-1 align-bottom"></span>
              ) : (
                <span className="text-blue-100">
                  {dbUserInfo?.name || "Admin"}
                </span>
              )}
              ! 👋
            </h2>
            <p className="text-slate-300 text-lg">
              System status is stable. Here is your administrative overview.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-inner">
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

      {/* Split Screen Layout */}
      <div className="flex flex-col gap-4">
        {/* Mobile Toggle Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowOpd(!showOpd)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-700 font-semibold"
          >
            <span>
              {showOpd ? "Hide OPD Management" : "Show OPD Management"}
            </span>
            {showOpd ? (
              <ChevronDown
                size={20}
                className="rotate-180 transition-transform"
              />
            ) : (
              <ChevronDown size={20} className="transition-transform" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full">
          {/* LEFT SIDE: Main OPD Section */}
          <section
            className={`lg:col-span-6 w-full ${
              showOpd ? "block" : "hidden lg:block"
            }`}
          >
            {hasActiveSession === null ? (
              <div className="w-full h-[500px] rounded-3xl border border-slate-200 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-slate-400 font-medium text-sm animate-pulse">
                    Checking session status...
                  </p>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {hasActiveSession ? (
                  <div className="relative">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-green-500/10 rounded-full blur-2xl animate-pulse" />
                    <IssueTicketComponent />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
                    <QueueCreation />
                  </div>
                )}
              </div>
            )}
          </section>

          {/* RIGHT SIDE: Quick Access Grid */}
          <section className="lg:col-span-6 w-full bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <ListTodo className="text-slate-600" size={24} />
              <h2 className="text-xl font-bold text-slate-800">
                Quick Actions
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <QuickAccessCard
                title="Active Sessions"
                icon={Activity}
                href="/admin/active-sessions"
                colorClass="bg-blue-600"
              />
              <QuickAccessCard
                title="Create Channel"
                icon={CalendarCheck}
                href="/admin/create-channel"
                colorClass="bg-indigo-600"
              />
              <QuickAccessCard
                title="Manage Admins"
                icon={UserCog}
                href="/admin/manage-admins"
                colorClass="bg-purple-600"
              />
              <QuickAccessCard
                title="Operator Reg"
                icon={UserPlus}
                href="/admin/ambulance-operator-reg"
                colorClass="bg-orange-600"
              />
              <QuickAccessCard
                title="Emergency Mgr"
                icon={ShieldAlert}
                href="/admin/emergency-manager-reg"
                colorClass="bg-red-600"
              />
              <QuickAccessCard
                title="Notices"
                icon={Megaphone}
                href="/admin/manage-notice"
                colorClass="bg-yellow-500"
              />
              <QuickAccessCard
                title="Lab Reports"
                icon={TestTube2}
                href="/admin/manage-lab-reports"
                colorClass="bg-teal-600"
              />
              <QuickAccessCard
                title="Health Tips"
                icon={FileText}
                href="/admin/manage-health-tips"
                colorClass="bg-pink-600"
              />
              <QuickAccessCard
                title="Approve Doctor"
                icon={Stethoscope}
                href="/admin/approve-doctor"
                colorClass="bg-emerald-600"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
