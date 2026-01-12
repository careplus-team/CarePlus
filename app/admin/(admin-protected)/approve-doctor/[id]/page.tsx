"use client";
import React, { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { toast } from "sonner";
import AdminSecurity from "@/lib/security-walls/admin-security";
import { useRouter, useParams } from "next/navigation";
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
  phoneNumber?: string;
  address?: string;
  workplace?: string;
  bio?: string;
  createdAt?: string;
}

const DoctorDetailsPage = () => {
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const params = useParams();
  // The dynamic route is [id], but we are passing encoded email
  const doctorEmail = decodeURIComponent(params.id as string);

  useEffect(() => {
    if (doctorEmail) {
      const fetchDoctor = async () => {
        try {
          const response = await axios.post("/api/doctor-details-get-api", {
            email: doctorEmail,
          });
          if (response.data.success) {
            setDoctor(response.data.data);
          } else {
            toast.error(response.data.message || "Doctor not found");
          }
        } catch (error) {
          toast.error("Failed to fetch doctor details");
        } finally {
          setLoading(false);
        }
      };
      fetchDoctor();
    }
  }, [doctorEmail]);

  const handleApprove = () => {
    if (!doctor) return;
    startTransition(async () => {
      try {
        const response = await axios.post("/api/doctor-verification-api", {
          email: doctor.email,
          status: true,
        });
        if (response.data.success) {
            toast.success("Doctor Approved Successfully");
            setDoctor({ ...doctor, verification: true });
            router.push("/admin/approve-doctor");
        } else {
            toast.error(response.data.message);
        }
      } catch (error) {
        toast.error("Failed to approve doctor");
      }
    });
  };

  const handleRevoke = () => {
    if (!doctor) return;
    
    // Current requirement: Revoke means DELETE account.
    if(!confirm("Warning: Revoking will PERMANENTLY DELETE this doctor's account from the database and authentication system. Are you sure?")) return;

    startTransition(async () => {
      try {
        const response = await axios.post("/api/doctor-delete-api", {
            email: doctor.email
        });
        if (response.data.success) {
            toast.success("Approval Revoked & Account Deleted Successfully");
             router.push("/admin/approve-doctor");
        } else {
            toast.error(response.data.message);
        }
      } catch (error) {
        toast.error("Failed to revoke approval (Delete failed)");
      }
    });
  };

  const handleReject = () => {
     if (!doctor) return;
     // Confirmation?
     if(!confirm("Are you sure you want to reject and delete this request? This action cannot be undone.")) return;

     startTransition(async () => {
        try {
            const response = await axios.post("/api/doctor-delete-api", {
                email: doctor.email
            });
            if(response.data.success) {
                toast.success("Request Rejected (Doctor Removed)");
                router.push("/admin/approve-doctor");
            } else {
                toast.error(response.data.message);
            }
        } catch(error) {
            toast.error("Failed to reject request");
        }
     });
  }

  if (loading) {
    return (
      <AdminSecurity>
        <div className="min-h-screen flex justify-center items-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminSecurity>
    );
  }

  if (!doctor) {
    return (
      <AdminSecurity>
         <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">Doctor not found</h2>
            <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
         </div>
      </AdminSecurity>
    );
  }

  return (
    <AdminSecurity>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            ← Back to List
          </Button>

          <Card className="overflow-hidden shadow-lg bg-white">
            <div className="h-32 bg-indigo-600"></div>
            <div className="px-8 pb-8">
              <div className="relative -mt-16 mb-6 flex justify-between items-end">
                <div className="rounded-full p-1 bg-white">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 relative">
                        {doctor.profilePicture ? (
                        <Image
                            src={doctor.profilePicture}
                            alt={doctor.name}
                            fill
                            className="object-cover"
                        />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500 text-4xl font-bold">
                            {doctor.name.charAt(0)}
                        </div>
                        )}
                    </div>
                </div>
                <div className="mb-4">
                     <span
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide ${
                          doctor.verification
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {doctor.verification ? "Verified Doctor" : "Pending Verification"}
                      </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{doctor.name}</h1>
                        <p className="text-lg text-indigo-600 font-medium">{doctor.specialization}</p>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                             <span className="w-24 font-medium text-gray-900">Email:</span>
                             <span>{doctor.email}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                             <span className="w-24 font-medium text-gray-900">Phone:</span>
                             <span>{doctor.phoneNumber || "N/A"}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                             <span className="w-24 font-medium text-gray-900">Reg No:</span>
                             <span>{doctor.medicalregno}</span>
                        </div>
                         <div className="flex items-center text-gray-600">
                             <span className="w-24 font-medium text-gray-900">Gender:</span>
                             <span>{doctor.gender}</span>
                        </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                     <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                         <h3 className="font-semibold text-gray-900 mb-2">Workplace / Clinic</h3>
                         <p className="text-gray-600">{doctor.workplace || "Not provided"}</p>
                         <h3 className="font-semibold text-gray-900 mt-4 mb-2">Address</h3>
                         <p className="text-gray-600">{doctor.address || "Not provided"}</p>
                     </div>
                     
                     {doctor.bio && (
                         <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Bio</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{doctor.bio}</p>
                         </div>
                     )}
                 </div>
              </div>

              <div className="border-t border-gray-100 mt-8 pt-8 flex justify-end gap-3">
                 <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                 </Button>
                 
                 {doctor.verification ? (
                    <Button 
                        onClick={handleRevoke} 
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={isPending}
                    >
                        {isPending ? "Processing..." : "Revoke Approval"}
                    </Button>
                 ) : (
                    <>
                        <Button 
                            onClick={handleReject} 
                            variant="destructive"
                            disabled={isPending}
                        >
                            {isPending ? "Processing..." : "Reject Request"}
                        </Button>
                        <Button 
                            onClick={handleApprove} 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isPending}
                        >
                            {isPending ? "Processing..." : "Approve Doctor"}
                        </Button>
                    </>
                 )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminSecurity>
  );
};

export default DoctorDetailsPage;
