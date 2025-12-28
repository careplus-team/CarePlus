"use client";

import React, { useState } from "react";
import { Users, Search, Phone, Calendar, User } from "lucide-react";

export default function PatientListViewComponent() {
  const [searchTerm, setSearchTerm] = useState("");

  // Dummy patient data
  const patients = [
    { id: "P001", name: "Sewmini Hansini", age: 19, gender: "Female", contact: "+94 77 123 4567", lastVisit: "2025-11-15", avatar: "SH" },
    { id: "P002", name: "Kasun Perera", age: 34, gender: "Male", contact: "+94 77 234 5678", lastVisit: "2025-11-20", avatar: "KP" },
    { id: "P003", name: "Dilani Weerarathne", age: 27, gender: "Female", contact: "+94 77 345 6789", lastVisit: "2025-11-10", avatar: "DW" },
    { id: "P004", name: "Nimal Fernando", age: 49, gender: "Male", contact: "+94 77 456 7890", lastVisit: "2025-11-05", avatar: "NF" },
    { id: "P005", name: "Ishara Madhushani", age: 22, gender: "Female", contact: "+94 77 567 8901", lastVisit: "2025-11-18", avatar: "IM" },
    { id: "P006", name: "Thushan Silva", age: 31, gender: "Male", contact: "+94 77 678 9012", lastVisit: "2025-11-12", avatar: "TS" },
  ];

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient List</h1>
              <p className="text-gray-600">View all registered patients</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patients by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Patient Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-white p-6 rounded-2xl shadow border border-gray-100 hover:shadow-lg transition">
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full 
                flex items-center justify-center text-white font-bold text-lg">
                  {patient.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
                  <p className="text-gray-500 text-sm">ID: {patient.id}</p>
                </div>
              </div>

              {/* Patient Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="text-sm">
                    {patient.age} years old • {patient.gender}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{patient.contact}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPatients.length === 0 && (
          <div className="bg-white p-12 text-center rounded-2xl shadow border border-gray-100 mt-8">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">Try a different search term</p>
          </div>
        )}

      </div>
    </div>
  );
}
