import EmgManagerSecurity from "@/lib/security-walls/emg-manager-security";
import EmergencyManagerNavbar from "@/lib/UI-helpers/navbars/emergency-manager-navbar";
import React from "react";

export default function EmergencyManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmgManagerSecurity>
      <div className="flex flex-col min-h-screen">
        <EmergencyManagerNavbar />
        <main className="flex-1 bg-slate-50">{children}</main>
      </div>
    </EmgManagerSecurity>
  );
}
