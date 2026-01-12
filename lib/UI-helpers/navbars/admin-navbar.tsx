"use client";

import React from "react";
import { DashboardNavbar } from "@/lib/UI-helpers/navbars/navbar-template";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LayoutDashboard, Users, FileText, Activity } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminNavbar() {
  const pathname = usePathname();

  // Helper to check if link is active
  const isActive = (path: string) => pathname === path;

  return (
    <DashboardNavbar
      brandName="CarePlus Admin"
      dashboardName="Administrator Control Panel"
    >
      <div className="flex items-center gap-2">
        <Link href="/admin">
          <Button
            variant={isActive("/admin") ? "secondary" : "ghost"}
            size="sm"
            className="gap-2"
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        </Link>
        <Link href="/admin/active-sessions">
          <Button
            variant={isActive("/admin/active-sessions") ? "secondary" : "ghost"}
            size="sm"
            className="gap-2"
          >
            <Activity size={16} />
            <span className="hidden sm:inline">Active Sessions</span>
          </Button>
        </Link>
      </div>
    </DashboardNavbar>
  );
}
