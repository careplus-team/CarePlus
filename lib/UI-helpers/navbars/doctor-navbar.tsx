"use client";
import React from "react";
import { DashboardNavbar } from "./navbar-template";

const DoctorNavbar = () => {
  return (
    <DashboardNavbar
      brandName="CarePlus"
      dashboardName="Doctor Dashboard"
      homeUrl="/doctor/doctor-dashboard"
    />
  );
};

export default DoctorNavbar;
