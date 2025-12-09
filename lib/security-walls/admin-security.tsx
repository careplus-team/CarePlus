"use client";
import axios from "axios";
import React, { ReactNode, useEffect, useState, useTransition } from "react";
import { fetchUserInfoFromAuth } from "../client-actions/current-user";
import { useRouter } from "next/navigation";

const AdminSecurity = ({ children }: { children: ReactNode }) => {
  const [isPending, startTransition] = useTransition();
  const [adminDetails, setAdminDetails] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    startTransition(async () => {
      const currentUserData = await fetchUserInfoFromAuth();

      console.log("current user data", currentUserData);
      if (!currentUserData?.data?.claims?.email) {
        // Handle unauthorized access
        router.push("/login");
        return;
      } else {
        // Check if user is admin
        const adminCheckData = await axios.post("/api/check-admin", {
          email: currentUserData?.data?.claims?.email,
        });
        console.log("admin check data", adminCheckData.data);
        if (!adminCheckData.data.isAdmin) {
          router.push("/login");
        } else {
          console.log("User is an admin");
          setAdminDetails(adminCheckData.data.data);
        }
      }
    });
  }, []);

  return (
    <div>
      {isPending || adminDetails === null ? (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="bg-transparent rounded-lg  p-8 max-w-sm w-full text-center">
            <div className="mb-6">
              <svg
                className="animate-spin mx-auto"
                width="60"
                height="60"
                viewBox="0 0 60 60"
                fill="none"
              >
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeDasharray="157"
                  strokeDashoffset="52"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Verifying Admin Access
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your permissions...
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default AdminSecurity;
