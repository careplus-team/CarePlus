"use client";

import { useEffect, useState } from "react";
import LoadingUI from "@/lib/UI-helpers/loading-ui";
import { Clock, AlertCircle, ArrowLeft, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

// TYPES
interface Patient {
  id: number;
  patientEmail: string ;
  patientNumber: number ;
  patientNote: string ;
  channeledDate: string ;
  channeledTime: string ;
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
}

// COMPONENT
export default function PatientListShow() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);

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
      .catch((err) => console.error("Failed to fetch patient details:", err));
  }, [selectedId, patients]);

  const selectedPatient = patients.find((p) => p.id === selectedId);

  if (loading) return <LoadingUI />;

  if (!channelId)
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        No channel selected.
      </div>
    );

  // UI
  return (
    <div className="h-screen bg-gray-50 p-4 md:p-6 flex flex-col">
      <h1 className="text-2xl font-bold text-emerald-500 mb-4">
        CarePlus – Patient List
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* PATIENT LIST */}
        <Card
          className={cn(
            "lg:col-span-7 p-4 overflow-y-auto",
            selectedId && "hidden lg:block"
          )}
        >
          {patients.length === 0 && (
            <p className="text-center text-gray-500">No patients in queue</p>
          )}

          {patients.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={cn(
                "p-4 mb-3 rounded-xl border cursor-pointer transition",
                selectedId === p.id
                  ? "bg-blue-50 border-blue-400"
                  : "border-gray-200 hover:border-blue-200"
              )}
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">Patient #{p.patientNumber}</h3>
                  <p className="text-sm text-gray-500">{p.patientEmail}</p>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                {p.patientNote || "No note"}
              </div>

              <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {p.channeledTime} | {p.channeledDate}
              </div>
            </div>
          ))}
        </Card>

        {/* DETAILS PANEL */}
        <Card
          className={cn(
            "lg:col-span-5 p-6",
            !selectedId && "hidden lg:flex items-center justify-center"
          )}
        >
          {!selectedPatient || !patientDetails ? (
            <p className="text-gray-500">Select a patient to view details</p>
          ) : (
            <>
              <div className="lg:hidden mb-4">
                <Button variant="ghost" onClick={() => setSelectedId(null)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </div>

              <h2 className="text-xl font-bold mb-4">{patientDetails.name}</h2>

              <Detail label="Email" value={selectedPatient.patientEmail} />
              <Detail label="Age" value={patientDetails.age.toString()} />
              <Detail label="Gender" value={patientDetails.gender} />
              <Detail label="Phone" value={patientDetails.mobilenumber || "—"} />
              <Detail label="Address" value={patientDetails.address || "—"} />
              <Detail label="Channel Name" value={selectedPatient.channel.name} />
              <Detail label="Channeled Date" value={selectedPatient.channeledDate} />
              <Detail label="Channeled Time" value={selectedPatient.channeledTime} />
              <Detail label="Note" value={selectedPatient.patientNote || "—"} />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

// DETAIL BLOCK
function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="mb-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="bg-gray-100 p-2 rounded text-sm">{value || "—"}</p>
    </div>
  );
}
