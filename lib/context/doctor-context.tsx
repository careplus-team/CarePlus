"use client";
import React, { createContext, useContext } from "react";

export interface DoctorDetails {
  name: string;
  email: string;
  specialization: string;
  medicalregno: string;
  profilePicture: string;
  // Add other fields as needed based on your prisma schema
}

interface DoctorContextType {
  doctorDetails: DoctorDetails | null;
  isLoading: boolean;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export const DoctorProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: DoctorContextType;
}) => {
  return (
    <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
  );
};

export const useDoctor = () => {
  const context = useContext(DoctorContext);
  if (context === undefined) {
    throw new Error("useDoctor must be used within a DoctorProvider");
  }
  return context;
};
