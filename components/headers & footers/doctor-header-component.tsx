"use client";
import React, { useTransition } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { useDoctor } from "@/lib/context/doctor-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const DoctorHeaderComponent = () => {
  const { doctorDetails } = useDoctor();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  // Handle Logout
  const handleLogout = async () => {
    startTransition(async () => {
      await supabase.auth.signOut();
      router.push("/login"); // or wherever the user should go
    });
  };

  if (!doctorDetails) return null;

  return (
    <div>
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side: Logo */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CarePlus</h1>
                <p className="text-xs text-gray-500">Healthcare Dashboard</p>
              </div>
            </div>

            {/* Right Side: Doctor Profile & Logout */}
            <div className="flex items-center space-x-4">
              {/* Profile Info */}
              <div className="flex items-center space-x-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <div className="relative h-8 w-8 rounded-full overflow-hidden border border-slate-200">
                  {doctorDetails.profilePicture ? (
                    <Image
                      src={doctorDetails.profilePicture}
                      alt={doctorDetails.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-300 flex items-center justify-center text-xs">
                      Dr
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block">
                  Dr. {doctorDetails.name}
                </span>
              </div>

              {/* Logout Button (Styled like User Nav) */}
              <Button
                onClick={handleLogout}
                disabled={isPending}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                {isPending ? (
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                )}
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default DoctorHeaderComponent;
