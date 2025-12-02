"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
  Eye,
  Play,
  UserCheck,
} from "lucide-react";

const DoctorDashboard = () => {
  type Channel = {
    id: string;
    name: string;
    room: string;
    date: string;
    time: string;
    status: string;
    description: string;
    patient_count: number;
  };

  const sampleChannels = [
    {
      id: "1",
      name: "General Checkup",
      room: "05",
      date: "2025-11-02",
      time: "08:30 AM",
      status: "confirmed",
      description: "Routine medical checkup and follow-up.",
      patient_count: 12,
    },
    {
      id: "2",
      name: "Fever & Flu Session",
      room: "02",
      date: "2025-12-12",
      time: "09:00 AM",
      status: "pending",
      description: "Consultations for fever and flu symptoms.",
      patient_count: 7,
    },
    {
      id: "3",
      name: "Daily OPD Consultations",
      room: "11",
      date: "2025-12-14",
      time: "10:15 AM",
      status: "completed",
      description: "General Outpatient Department service.",
      patient_count: 14,
    },
    {
      id: "4",
      name: "Back Pain Treatment",
      room: "09",
      date: "2025-03-12",
      time: "11:00 AM",
      status: "confirmed",
      description: "Muscle & spine-related consultation.",
      patient_count: 9,
    },
    {
      id: "5",
      name: "Blood Test Review Session",
      room: "14",
      date: "2025-03-12",
      time: "11:45 AM",
      status: "pending",
      description: "Blood report evaluations and follow-up.",
      patient_count: 5,
    },
    {
      id: "6",
      name: "Diabetes Follow-up",
      room: "07",
      date: "2025-03-12",
      time: "12:30 PM",
      status: "confirmed",
      description: "Diabetes management and review.",
      patient_count: 18,
    },
  ];

  const [selected, setSelected] = useState<Channel | any>(null);

  const getStatusColor = (status: any) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-800">CarePlus</h1>
        <p className="text-gray-600 mt-1 text-lg">Doctor Dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SECTION - ASSIGNED CHANNELS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Assigned Channels
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              View and manage your consultation sessions
            </p>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {sampleChannels.map((ch) => (
                <div
                  key={ch.id}
                  className="p-5 bg-white border rounded-2xl shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {ch.name}
                      </h3>

                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>Room {ch.room}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{ch.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{ch.time}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mt-2">
                        {ch.description}
                      </p>
                    </div>

                    {/* STATUS + PATIENT COUNT */}
                    <div className="flex flex-col items-end">
                      <div
                        className={`px-3 py-1 text-xs rounded-full border flex items-center space-x-1 ${getStatusColor(
                          ch.status
                        )}`}
                      >
                        {getStatusIcon(ch.status)}
                        <span className="capitalize">{ch.status}</span>
                      </div>

                      <p className="text-2xl font-bold text-gray-800 mt-3">
                        {ch.patient_count}
                      </p>
                      <p className="text-xs text-gray-500">Patients</p>

                      {/* VIEW BUTTON */}
                      <button
                        onClick={() => setSelected(ch as any)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - DETAILS */}
        <div>
          <div className="bg-white rounded-3xl shadow-xl border p-8 min-h-[400px]">
            <div className="flex items-center space-x-2 mb-6">
              <Eye className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-800">
                Channel Details
              </h3>
            </div>

            {!selected ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-600">
                  No channel selected
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Click "View" in the assigned list
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium">
                    Channel Name
                  </p>
                  <p className="font-bold text-gray-800 text-lg">
                    {selected.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-medium">
                      Room
                    </p>
                    <p className="font-semibold text-gray-700 mt-1">
                      {selected.room}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 uppercase font-medium">
                      Patients
                    </p>
                    <p className="font-semibold text-gray-700 mt-1">
                      {selected.patient_count}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium">
                    Date & Time
                  </p>
                  <p className="font-semibold text-gray-700 mt-1">
                    {selected.date} • {selected.time}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium">
                    Description
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {selected.description}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">
                    Status
                  </p>
                  <div
                    className={`inline-flex items-center space-x-2 px-3 py-1 mt-1 rounded-full border ${getStatusColor(
                      selected.status
                    )}`}
                  >
                    {getStatusIcon(selected.status)}
                    <span className="capitalize">{selected.status}</span>
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="space-y-3 pt-4 border-t">
                  <button className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                    <Play className="w-5 h-5" />
                    <span>Start Consultation</span>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Complete</span>
                    </button>

                    <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">
                      <UserCheck className="w-4 h-4" />
                      <span>Show Patients</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
