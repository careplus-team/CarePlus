"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import LoadingUI from "@/lib/UI-helpers/loading-ui";
import {
  Clock,
  AlertCircle,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Mail,
  Calendar,
  Hash,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

// TYPES
interface Patient {
  id: number;
  patientEmail: string;
  patientNumber: number;
  patientNote: string;
  channeledDate: string;
  channeledTime: string;
  channel: {
    id: number;
    name: string | null;
  };
}

interface PatientDetails {
  name: string;
  age: number;
  gender: string;
  mobilenumber?: string;
  address?: string;
  profilePicture?: string;
}

// COMPONENT
export default function PatientListShow() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const [detailsLoading, setDetailsLoading] = useState(false);

  const searchParams = useSearchParams();
  const channelId = searchParams.get("channelId");

  // FETCH PATIENT LIST
  useEffect(() => {
    if (!channelId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("/api/get-channeling-paient-list-api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId: Number(channelId) }),
    })
      .then(async (res) => {
        const result = await res.json();
        if (!result.success) throw new Error(result.message);
        setPatients(result.data);
      })
      .catch((err) => console.error("Failed to fetch patients:", err))
      .finally(() => setLoading(false));
  }, [channelId]);

  // FETCH SELECTED PATIENT DETAILS
  useEffect(() => {
    if (!selectedId) {
      setPatientDetails(null);
      return;
    }

    const patient = patients.find((p) => p.id === selectedId);
    if (!patient?.patientEmail) return;

    setDetailsLoading(true);
    fetch("/api/get-user-by-email-api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: patient.patientEmail }),
    })
      .then(async (res) => {
        const result = await res.json();
        if (!result.success) throw new Error(result.message);
        setPatientDetails(result.data);
      })
      .catch((err) => console.error("Failed to fetch patient details:", err))
      .finally(() => setDetailsLoading(false));
  }, [selectedId, patients]);

  const selectedPatient = patients.find((p) => p.id === selectedId);

  if (loading) return <LoadingUI />;

  if (!channelId)
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4 text-gray-500 animate-in fade-in zoom-in">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <p className="font-medium">No channel selected</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );

  // UI
  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-50/50 p-4 lg:p-6 flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Patient Queue
          </h1>
          <p className="text-slate-500 text-sm">
            Manage appointments for{" "}
            {selectedPatient?.channel?.name || "current session"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="px-3 py-1 h-8 text-sm font-medium bg-white shadow-sm border border-slate-200"
          >
            Total Patients: {patients.length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* PATIENT LIST COLUMN */}
        <div
          className={cn(
            "lg:col-span-5 h-full flex flex-col gap-4",
            selectedId && "hidden lg:flex" // Hide on mobile if selected
          )}
        >
          <Card className="h-full border-slate-200 shadow-sm flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm">
            <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Waiting List
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {patients.length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                  <User className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm">No patients in queue</p>
                </div>
              )}

              {patients.map((p) => (
                <PatientListItem
                  key={p.id}
                  patient={p}
                  isSelected={selectedId === p.id}
                  onClick={() => setSelectedId(p.id)}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* DETAILS COLUMN */}
        <div
          className={cn(
            "lg:col-span-7 h-full",
            !selectedId && "hidden lg:flex" // Hide on mobile if NO selection, but show generic placeholder on desktop
          )}
        >
          <Card className="h-full border-slate-200 shadow-sm flex flex-col overflow-hidden bg-white">
            {!selectedPatient ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center animate-in fade-in">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                  <User className="w-10 h-10 opacity-30" />
                </div>
                <h3 className="text-lg font-medium text-slate-700">
                  No Patient Selected
                </h3>
                <p className="max-w-xs mx-auto mt-2 text-sm text-slate-500">
                  Select a patient from the list on the left to view their
                  detailed information and medical records.
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                {/* Mobile Back Header */}
                <div className="lg:hidden p-4 border-b border-slate-100 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedId(null)}
                    className="-ml-2"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                  </Button>
                </div>

                {/* Patient Header */}
                <div className="p-6 pb-2 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-200 ring-4 ring-white overflow-hidden">
                        {patientDetails?.profilePicture ? (
                          <Image
                            src={patientDetails.profilePicture}
                            alt={patientDetails.name || "Patient"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          patientDetails?.name?.charAt(0) || "P"
                        )}
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          {patientDetails?.name || "Loading..."}
                        </h2>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200"
                          >
                            {patientDetails?.age} Years Old
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 capitalize"
                          >
                            {patientDetails?.gender}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                            Token #{selectedPatient.patientNumber}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                  {detailsLoading || !patientDetails ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-8 bg-slate-100 rounded w-1/3"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-slate-100 rounded"></div>
                        <div className="h-24 bg-slate-100 rounded"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Contact Info */}
                      <section>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <User className="h-4 w-4" /> Personal Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <InfoCard
                            icon={<Mail className="w-4 h-4 text-blue-500" />}
                            label="Email Address"
                            value={selectedPatient.patientEmail}
                          />
                          <InfoCard
                            icon={<Phone className="w-4 h-4 text-green-500" />}
                            label="Phone Number"
                            value={patientDetails.mobilenumber}
                          />
                          <InfoCard
                            icon={<MapPin className="w-4 h-4 text-red-500" />}
                            label="Address"
                            value={patientDetails.address}
                            span="col-span-2"
                          />
                        </div>
                      </section>

                      {/* Appointment Info */}
                      <section>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Clock className="h-4 w-4" /> Appointment Details
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <InfoCard
                            icon={<Hash className="w-4 h-4 text-indigo-500" />}
                            label="Channel ID"
                            value={selectedPatient.channel.name}
                          />
                          <InfoCard
                            icon={
                              <Calendar className="w-4 h-4 text-orange-500" />
                            }
                            label="Date & Time"
                            value={`${selectedPatient.channeledDate} at ${selectedPatient.channeledTime}`}
                          />
                        </div>
                      </section>

                      {/* Notes */}
                      {selectedPatient.patientNote && (
                        <section>
                          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" /> Patient Note
                          </h3>
                          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-900 text-sm leading-relaxed">
                            {selectedPatient.patientNote}
                          </div>
                        </section>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-4 flex gap-3">
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                          Start Consultation
                        </Button>
                        <Button variant="outline" className="flex-1">
                          View Medical History
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// Reusable Small Components
function PatientListItem({
  patient,
  isSelected,
  onClick,
}: {
  patient: Patient;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/get-user-by-email-api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: patient.patientEmail }),
    })
      .then(async (res) => {
        const result = await res.json();
        if (result.success) {
          setUserData(result.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [patient.patientEmail]);

  const displayName = userData?.name || `Patient #${patient.patientNumber}`;
  const profilePic = userData?.profilePicture;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ease-in-out hover:shadow-md",
        isSelected
          ? "bg-blue-50/50 border-blue-500/50 shadow-sm ring-1 ring-blue-500/20"
          : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors overflow-hidden",
                isSelected
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700"
              )}
            >
              {loading ? (
                <div className="animate-pulse w-full h-full bg-slate-200" />
              ) : profilePic ? (
                <Image
                  src={profilePic}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                displayName.charAt(0)
              )}
            </div>
          </div>

          <div>
            {loading ? (
              <div className="h-4 w-24 bg-slate-100 rounded animate-pulse mb-1" />
            ) : (
              <p className="font-semibold text-slate-900 leading-none">
                {displayName}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1 truncate max-w-[180px]">
              {patient.patientEmail}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="bg-white/50 font-mono text-xs items-center gap-1"
        >
          <Clock className="w-3 h-3" /> {patient.channeledTime}
        </Badge>
      </div>

      {patient.patientNote && (
        <div className="ml-12 mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{patient.patientNote}</span>
        </div>
      )}
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  span = "",
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  span?: string;
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors group",
        span
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 p-2 bg-white rounded-lg shadow-sm group-hover:shadow text-slate-500">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400 mb-0.5">{label}</p>
          <p className="text-sm font-semibold text-slate-800 break-all">
            {value || "Not Provided"}
          </p>
        </div>
      </div>
    </div>
  );
}
