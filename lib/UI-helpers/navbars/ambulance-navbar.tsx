"use client";
import React from "react";
import { DashboardNavbar } from "./navbar-template";
import { Ambulance, UserRoundSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const AmbulanceNavbar = () => {
  const router = useRouter();
  return (
    <DashboardNavbar brandName="Care Plus" dashboardName="Ambulance Dashboard">
      <Button onClick={() => router.push("/profile")} variant="ghost">
        <UserRoundSearch className="mr-2 h-4 w-4" />
        My Profile
      </Button>
    </DashboardNavbar>
  );
};

export default AmbulanceNavbar;
