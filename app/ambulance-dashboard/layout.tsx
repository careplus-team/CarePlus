import AmbulanceOperatorSecurity from "@/lib/security-walls/ambulance-operator-security";
import AmbulanceNavbar from "@/lib/UI-helpers/navbars/ambulance-navbar";
import React from "react";

export default function AmbulanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AmbulanceOperatorSecurity>
      <div className="flex flex-col min-h-screen">
        <AmbulanceNavbar />
        <main className="flex-1 bg-slate-50">{children}</main>
      </div>
    </AmbulanceOperatorSecurity>
  );
}
