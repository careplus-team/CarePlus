"use client";
import React, { useTransition } from "react";
import { DashboardNavbar } from "./navbar-template";
import { Activity, ClipboardMinus, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const UserNavbar = () => {
  const router = useRouter();

  return (
    <DashboardNavbar
      brandName="Care Plus"
      brandIcon={<Activity className="h-6 w-6 text-blue-600" />}
    >
      {/* These buttons appear on the right on Desktop, and inside the drawer on Mobile */}
      <Button onClick={() => router.push("/my-lab-reports")} variant="ghost">
        <ClipboardMinus /> My Reports
      </Button>
      <Button variant="ghost">
        <History />
        Chaneling History
      </Button>
    </DashboardNavbar>
  );
};

export default UserNavbar;
