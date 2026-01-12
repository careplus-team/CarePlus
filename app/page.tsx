"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Activity,
  Users,
  ShieldCheck,
  Zap,
  Calendar,
  Ambulance,
  Radio,
  Megaphone,
  PlugZap,
  ArrowBigDownDashIcon,
  Ticket,
  Timer,
  LayoutDashboard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import AdminNavbar from "@/lib/UI-helpers/navbars/admin-navbar";
import UserNavbar from "@/lib/UI-helpers/navbars/user-navbar";
import AmbulanceNavbar from "@/lib/UI-helpers/navbars/ambulance-navbar";
import EmergencyManagerNavbar from "@/lib/UI-helpers/navbars/emergency-manager-navbar";
import { DashboardNavbar } from "@/lib/UI-helpers/navbars/navbar-template";
import FooterComponent from "@/components/headers & footers/footer-component";

export default function LandingPage() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const client = createClient();
    const checkRole = async () => {
      try {
        const {
          data: { user },
        } = await client.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        // Check user table
        const { data: userData } = await client
          .from("user")
          .select("role")
          .eq("email", user.email)
          .single();

        if (userData) {
          setRole(userData.role);
          setIsLoading(false);
          return;
        }

        // Check doctor table
        const { data: doctorData } = await client
          .from("doctor")
          .select("*")
          .eq("email", user.email)
          .single();

        if (doctorData) {
          setRole("doctor");
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error checking role:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkRole();
  }, []);

  const renderNavbar = () => {
    if (isLoading) {
      return (
        <nav className="fixed top-0 w-full z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className=" absolute top-4  ">
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500  to-green-500 font-bold  text-2xl">
                  CarePlus
                </p>
              </div>
            </div>
          </div>
        </nav>
      );
    }

    if (role === "admin") return <AdminNavbar />;
    if (role === "ambulance_operator") return <AmbulanceNavbar />;
    if (role === "emergency_manager") return <EmergencyManagerNavbar />;
    if (role === "user") return <UserNavbar />;
    if (role === "doctor") {
      return (
        <DashboardNavbar
          brandName="Care Plus"
          brandIcon={<Activity className="h-6 w-6 text-blue-600" />}
          dashboardName="Doctor Portal"
        >
          <Link href="/doctor/doctor-dashboard">
            <Button variant="ghost" className="gap-2">
              <LayoutDashboard size={16} />
              Dashboard
            </Button>
          </Link>
        </DashboardNavbar>
      );
    }

    // Default Not Logged In Navbar
    return (
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className=" absolute top-4  ">
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500  to-green-500 font-bold  text-2xl">
                <a href="/">CarePlus</a>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full px-6"
              >
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6 font-medium transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 text-slate-900">
      {/* Navigation */}
      {renderNavbar()}

      {/* Hero Section */}
      <section className=" h-screen lg:px-20 flex flex-col justify-center items-center pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-sm text-blue-600 mb-8 font-medium">
              <div>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              Connected, Elevated, Assured
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-slate-900 leading-[1.1]">
              Care Plus <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Digital Health
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Transform your daily care into a sophisticated digital journey.
              Sync with practitioners, unlock instant health clarity, and
              navigate life with an always-active safety net.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4  ">
              <Link href="/signup">
                <Button className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-medium transition-all duration-300 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Visual (Mock Interface) */}
          <div className="relative hidden lg:block">
            {/* Abstract decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-2xl animate-pulse" />

            {/* Main Card */}
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl shadow-slate-200/50 max-w-md mx-auto transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      Dr. Sarah Smith
                    </div>
                    <div className="text-xs text-slate-500">Cardiologist</div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  Online
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-medium text-slate-700">
                      Next Appointment
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    Today, 2:00 PM
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                    <div className="flex items-center gap-2 mb-2 text-red-600">
                      <Ticket className="w-4 h-4 " />
                      <span className="text-xs font-bold">Your Ticket</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      86{" "}
                      <span className="text-sm font-normal text-slate-500">
                        /100
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2 text-indigo-600">
                      <Timer className="w-4 h-4 " />
                      <span className="text-xs font-bold">Estimate Time</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      45
                      <span className="text-sm font-normal text-slate-500">
                        mins
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 animate-bounce duration-1000">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 animate-bounce duration-1000">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className=" lg:hidden flex justify-center relative top-16 w-screen">
          <ArrowBigDownDashIcon
            onClick={() => {
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className=" lg:hidden bottom-10 left-1/2 -translate-x-1/2 w-10 h-10 text-slate-400 animate-bounce"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative ">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Choose CarePlus?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Experience healthcare reimagined with features designed for your
              peace of mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Specialist Sync */}
            <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Specialist Sync
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Seamlessly connect with top-tier healthcare professionals.
                Real-time scheduling and instant communication channels.
              </p>
            </div>

            {/* Feature 2: Vital Insights */}
            <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-green-200 hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300">
              <div className="w-14 h-14 bg-green-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Digital Vitality
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Your health data, liberated. Visualize and download verified
                medical insights securely from your personal dashboard the
                moment they arrive.
              </p>
            </div>

            {/* Feature 3: Secure Vault */}
            <div className="group p-8 rounded-3xl bg-slate-50 border border-red-100 hover:border-red-200 hover:shadow-xl hover:shadow-red-100/50 transition-all duration-300">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Ambulance className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Emergency Response
              </h3>
              <p className="text-slate-600 leading-relaxed">
                A safety net that travels with you. Trigger immediate,
                location-aware assistance that guides help to your exact
                coordinates when seconds count.
              </p>
            </div>

            {/* Feature 4: Secure Vault */}
            <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Radio className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Live Clinic Pulse
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Value your time by knowing before you go. Monitor real-time
                patient volumes and facility status from home to ensure a
                seamless visit.
              </p>
            </div>
            {/* Feature 5: Secure Vault */}
            <div className="group p-8 rounded-3xl bg-slate-50 border border-yellow-100 hover:border-yellow-200 hover:shadow-xl hover:shadow-yellow-100/50 transition-all duration-300">
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Megaphone className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                The Health Feed
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Stay seamlessly connected. Receive direct, centralized updates
                on medical announcements and community health events instantly.
              </p>
            </div>
            {/* Feature 6: Secure Vault */}
            <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <PlugZap className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Unified Ecosystem
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Care without boundaries. A single, centralized hub that connects
                every aspect of your medical journey, accessible from anywhere,
                at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight text-white">
            Ready to elevate your <br />
            <span className="text-blue-400">Health Experience?</span>
          </h2>
          <p className="text-slate-300 mb-10 text-lg max-w-2xl mx-auto">
            Join thousands of users who have already taken control of their
            well-being with our advanced platform.
          </p>
          <Link href="/signup">
            <Button className="h-14 px-10 bg-white text-slate-900 hover:bg-blue-50 rounded-full text-lg font-bold transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-1">
              <Zap className="w-5 h-5 mr-2 fill-slate-900" />
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <FooterComponent />
    </div>
  );
}
