"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  Calendar, 
  User, 
  Activity, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock Data for Patients
const MOCK_PATIENTS = [
  {
    id: "1",
    name: "Sarah Johnson",
    age: 28,
    gender: "Female",
    status: "waiting",
    arrivalTime: "09:15 AM",
    symptoms: "Severe migraine, sensitivity to light",
    priority: "high",
    contact: "+1 (555) 123-4567",
    email: "sarah.j@example.com",
    address: "123 Maple Ave, Springfield",
    vitals: {
      bp: "120/80",
      heartRate: "72 bpm",
      temp: "98.6°F",
      weight: "65 kg"
    },
    history: ["Asthma", "Seasonal Allergies"]
  },
  {
    id: "2",
    name: "Michael Chen",
    age: 45,
    gender: "Male",
    status: "in-progress",
    arrivalTime: "08:45 AM",
    symptoms: "Persistent cough, fever",
    priority: "medium",
    contact: "+1 (555) 987-6543",
    email: "m.chen@example.com",
    address: "456 Oak Ln, Metropolis",
    vitals: {
      bp: "135/85",
      heartRate: "88 bpm",
      temp: "101.2°F",
      weight: "82 kg"
    },
    history: ["Hypertension"]
  },
  {
    id: "3",
    name: "Emily Davis",
    age: 62,
    gender: "Female",
    status: "completed",
    arrivalTime: "08:30 AM",
    symptoms: "Routine checkup, prescription renewal",
    priority: "low",
    contact: "+1 (555) 456-7890",
    email: "emily.d@example.com",
    address: "789 Pine St, Gotham",
    vitals: {
      bp: "118/75",
      heartRate: "68 bpm",
      temp: "98.4°F",
      weight: "70 kg"
    },
    history: ["Type 2 Diabetes", "Arthritis"]
  },
  {
    id: "4",
    name: "James Wilson",
    age: 34,
    gender: "Male",
    status: "waiting",
    arrivalTime: "09:45 AM",
    symptoms: "Lower back pain after lifting",
    priority: "medium",
    contact: "+1 (555) 222-3333",
    email: "j.wilson@example.com",
    address: "321 Elm St, Smallville",
    vitals: {
      bp: "125/82",
      heartRate: "76 bpm",
      temp: "98.7°F",
      weight: "90 kg"
    },
    history: ["None"]
  },
  {
    id: "5",
    name: "Olivia Martinez",
    age: 8,
    gender: "Female",
    status: "waiting",
    arrivalTime: "10:00 AM",
    symptoms: "Stomach ache, nausea",
    priority: "high",
    contact: "+1 (555) 777-8888",
    email: "parent.martinez@example.com",
    address: "654 Cedar Blvd, Star City",
    vitals: {
      bp: "100/65",
      heartRate: "95 bpm",
      temp: "99.5°F",
      weight: "28 kg"
    },
    history: ["Peanut Allergy"]
  }
];

export default function PatientListShow() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const selectedPatient = MOCK_PATIENTS.find(p => p.id === selectedPatientId);

  const filteredPatients = MOCK_PATIENTS.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          patient.symptoms.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting": return "bg-amber-100 text-amber-700 border-amber-200";
      case "in-progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500 bg-red-50 border-red-100";
      case "medium": return "text-amber-500 bg-amber-50 border-amber-100";
      case "low": return "text-green-500 bg-green-50 border-green-100";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="h-screen bg-gray-50/50 p-4 md:p-6 flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="mb-2 flex-shrink-0">
        <h1 className="text-2xl font-bold text-emerald-500">CarePlus</h1>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Patient Queue</h1>
          <p className="text-gray-500 mt-1">Manage today's appointments and patient details efficiently.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Patient List */}
        <Card className={cn(
          "lg:col-span-7 flex-col h-full min-h-0 border border-gray-200 shadow-xl shadow-gray-100/50 overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl",
          selectedPatientId ? "hidden lg:flex" : "flex"
        )}>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatientId(selectedPatientId === patient.id ? null : patient.id)}
                className={cn(
                  "group relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md",
                  selectedPatientId === patient.id 
                    ? "bg-blue-50/50 border-blue-300 shadow-sm ring-1 ring-blue-100" 
                    : "bg-white border-gray-200 hover:border-blue-200"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold",
                      selectedPatientId === patient.id ? "bg-blue-200 text-blue-700" : "bg-gray-100 text-gray-600"
                    )}>
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-semibold text-sm",
                        selectedPatientId === patient.id ? "text-blue-900" : "text-gray-900"
                      )}>
                        {patient.name}
                      </h3>
                      <p className="text-xs text-gray-500">{patient.age} yrs • {patient.gender}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 h-5 border", getStatusColor(patient.status))}>
                    {patient.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 mt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Activity className="w-3 h-3 text-blue-500" />
                    <span className="truncate">{patient.symptoms}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400 px-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {patient.arrivalTime}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/*  Patient Details */}
        <div className={cn(
          "lg:col-span-5 h-full min-h-0",
          selectedPatientId ? "flex flex-col" : "hidden lg:flex flex-col"
        )}>
          {selectedPatient ? (
            <Card className="h-full border border-gray-200 shadow-xl shadow-gray-100/50 flex flex-col bg-white/80 backdrop-blur-sm rounded-xl">
              {/* Detail Header */}
              <div className="p-6 border-b bg-white flex-shrink-0">
                <div className="lg:hidden mb-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedPatientId(null)} 
                    className="gap-2 pl-0 hover:bg-transparent text-gray-600 -ml-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to List
                  </Button>
                </div>
                <div className="flex gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xl font-bold text-blue-600 shadow-inner">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h2>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><User className="w-4 h-4" /> {selectedPatient.age} Years, {selectedPatient.gender}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  <section>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-500" /> Chief Complaint
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-xl border-2 border-gray-200 text-gray-700 text-sm leading-relaxed">
                      {selectedPatient.symptoms}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" /> Arrival Time
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-xl border-2 border-gray-200 text-gray-700 text-sm">
                      {selectedPatient.arrivalTime}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-500" /> Contact
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-xl border-2 border-gray-200 text-gray-700 text-sm">
                      {selectedPatient.contact}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" /> Address
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-xl border-2 border-gray-200 text-gray-700 text-sm">
                      {selectedPatient.address}
                    </div>
                  </section>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full border border-gray-200 shadow-xl shadow-gray-100/50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm text-center p-8 rounded-xl">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <User className="w-10 h-10 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Patient Selected</h3>
              <p className="text-gray-500 max-w-xs mx-auto">Select a patient from the queue on the left to view their full medical details and start a consultation.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
