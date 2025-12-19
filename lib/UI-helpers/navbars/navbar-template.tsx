"use client";

import React, { use, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { is } from "date-fns/locale";

interface DashboardNavbarProps {
  /** The name of your app/company */
  brandName?: string;
  /** The logo or icon component */
  brandIcon?: React.ReactNode;
  /** Optional specific name for the current dashboard view (e.g., "Doctor Portal") */
  dashboardName?: string;
  /** The buttons or user profile components to display */
  children?: React.ReactNode;
  /** Custom styles */
  className?: string;
}

export function DashboardNavbar({
  brandName = "Care Plus",
  brandIcon,
  dashboardName,
  children,
  className,
}: DashboardNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const client = createClient();
  const [dbUserInfo, setDbUserInfo] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {});

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
        getUserInfoFromDb(data.user.email);
      }
    });
  };

  useEffect(() => {
    fetchUserInfoFromAuth();
  }, []);
  const router = useRouter();
  const [isLoading, startTransitionLogout] = useTransition();

  return (
    <>
      {/* --- Main Navbar --- */}
      <nav
        className={cn(
          "sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md transition-all",
          className
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* LEFT: Mobile Menu + Brand */}
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger (Visible only on mobile) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </button>

            {/* Brand Section */}
            <Link href="/home" className="flex items-center gap-2">
              {brandIcon && <span className="text-primary">{brandIcon}</span>}
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold text-gray-900">
                  {brandName}
                </span>
              </div>
            </Link>

            {/* Dashboard Name Separator (Desktop only) */}
            {dashboardName && (
              <div className="hidden items-center gap-4 md:flex">
                <div className="h-6 w-[1px] bg-gray-300" />
                <span className="text-sm font-medium text-gray-500">
                  {dashboardName}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: Actions (Desktop) */}
          {/* Hidden on mobile, Flex on MD+ */}
          <div className="hidden items-center gap-4 md:flex">
            {children}

            {/* User Avatar */}
            <div className="flex items-center gap-3">
              <Image
                src={dbUserInfo?.profilePicture || "/temp_user.webp"}
                alt={dbUserInfo?.name || userInfo?.user?.email || "User Avatar"}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <Button
                onClick={() => {
                  startTransitionLogout(async () => {
                    await client.auth.signOut();
                    router.push("/login");
                  });
                }}
                className={`bg-red-600 hover:bg-red-700 ${
                  isPending ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isPending}
              >
                {isPending
                  ? "Loading..."
                  : isLoading
                  ? "Logging out..."
                  : "Logout"}
              </Button>
            </div>
          </div>

          {/* Mobile Placeholder for Right side alignment if needed */}
          <div className="md:hidden" />
        </div>
      </nav>

      {/* --- Mobile Menu Drawer (Aceternity Style Animation) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm md:hidden"
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm border-r border-gray-200 bg-white p-6 shadow-xl md:hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-900">
                  {brandName}
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile: User Card */}
              <div className="mb-6 flex items-center gap-3">
                <Image
                  src={dbUserInfo?.profilePicture || "/temp_user.webp"}
                  alt={
                    dbUserInfo?.name || userInfo?.user?.email || "User Avatar"
                  }
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900 truncate">
                    {dbUserInfo?.name || userInfo?.user?.email || "Guest"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {dbUserInfo?.email || userInfo?.user?.email}
                  </p>
                </div>
              </div>

              {dashboardName && (
                <div className="mb-6 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Current View
                  </p>
                  <p className="font-medium text-gray-900">{dashboardName}</p>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {/* Render the buttons passed as children here for mobile */}
                {children}
                <Button
                  onClick={() => {
                    startTransitionLogout(async () => {
                      await client.auth.signOut();
                      router.push("/login");
                    });
                  }}
                  className={`bg-red-600 hover:bg-red-700 ${
                    isPending ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isPending}
                >
                  {isPending
                    ? "Loading..."
                    : isLoading
                    ? "Logging out..."
                    : "Logout"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
