"use client";
import React, { useEffect, useState, useTransition } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import axios from "axios";
import { toast } from "sonner";
import AdminSecurity from "@/lib/security-walls/admin-security";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface DoctorData {
  id: string;
  name: string;
  email: string;
  specialization: string;
  medicalregno: string;
  gender: string;
  profilePicture?: string;
  verification: boolean;
  mobileNumber?: string;
  address?: string;
  workplace?: string;
  bio?: string;
  createdAt?: string;
}

const DoctorApproveComponent = () => {
  const [pendingDoctors, setPendingDoctors] = useState<DoctorData[]>([]);
  const [approvedDoctors, setApprovedDoctors] = useState<DoctorData[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const fetchDoctors = () => {
    startTransition(async () => {
      try {
        // Fetch Pending Doctors
        const pendingRes = await axios.post("/api/doctor-list-get-api", {
          type: "pending",
        });
        if (pendingRes.data.success) {
          setPendingDoctors(pendingRes.data.data);
        }

        // Fetch Approved Doctors
        const approvedRes = await axios.post("/api/doctor-list-get-api", {
          type: "approved",
        });
        if (approvedRes.data.success) {
          setApprovedDoctors(approvedRes.data.data);
        }
      } catch (error) {
        toast.error("Error fetching doctors");
        console.error(error);
      }
    });
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleViewDetails = (email: string) => {
    router.push(`/admin/approve-doctor/${encodeURIComponent(email)}`); // Using encoded email as ID
  };

  const DoctorCard = ({ doctor }: { doctor: DoctorData }) => (
    <Card className="p-4 shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 mb-2">
          {doctor.profilePicture ? (
            <Image
              src={doctor.profilePicture}
              alt={doctor.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500 text-2xl font-bold">
              {doctor.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{doctor.name}</h3>
          <p className="text-sm text-gray-500">{doctor.specialization}</p>
          <p className="text-xs text-gray-400 mt-1">{doctor.email}</p>
        </div>
        <div className="w-full pt-2">
           <Button
            onClick={() => handleViewDetails(doctor.email)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            size="sm"
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <AdminSecurity>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Doctor Management
              </h1>
              <p className="text-gray-600">
                Manage doctor verifications and profiles
              </p>
            </div>
            <Button 
                variant="outline" 
                onClick={fetchDoctors}
                className="self-start md:self-center"
            >
                Refresh Lists
            </Button>
          </div>

          {isPending ? (
             <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
             </div>
          ) : (
            <>
              {/* Pending Approvals Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-amber-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-800">Pending Approvals ({pendingDoctors.length})</h2>
                </div>
                
                {pendingDoctors.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {pendingDoctors.map((doctor) => (
                      <DoctorCard key={doctor.email} doctor={doctor} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/50 rounded-lg p-8 text-center text-gray-500 border border-dashed border-gray-300">
                    No pending approvals found.
                  </div>
                )}
              </div>

              {/* Approved Doctors Section */}
              <div className="space-y-4 pt-8">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-green-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-800">Approved Doctors ({approvedDoctors.length})</h2>
                </div>

                {approvedDoctors.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {approvedDoctors.map((doctor) => (
                      <DoctorCard key={doctor.email} doctor={doctor} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/50 rounded-lg p-8 text-center text-gray-500 border border-dashed border-gray-300">
                    No approved doctors found.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminSecurity>
  );
};

export default DoctorApproveComponent;
