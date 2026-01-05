"use client";

import React, { useState } from "react";
import {
  Truck,
  User,
  Phone,
  MapPin,
  CheckCircle,
  Eye,
  ArrowDownLeftFromCircle,
  Wrench,
  Navigation,
  Info,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- DUMMY DATA ---
const DUMMY_AMBULANCES = [
  {
    id: "1",
    ambulanceNumber: "GA-8829",
    driverName: "John Wick",
    driverPhone: "+94771234567",
    status: "Available",
    fuelLevel: "92%",
    lastLocation: "Main Hospital Entrance",
    image_url: "https://images.unsplash.com/photo-1587744356975-dbb1579720b0?auto=format&fit=crop&q=80&w=400",
    notes: "Fully stocked with emergency trauma kits. Oxygen tanks refilled today.",
  },
  {
    id: "2",
    ambulanceNumber: "NY-4402",
    driverName: "Sarah Connor",
    driverPhone: "+94777654321",
    status: "On-Mission",
    fuelLevel: "45%",
    lastLocation: "5th Avenue, Sector 4",
    image_url: "https://images.unsplash.com/photo-1612997951721-0d34100e4427?auto=format&fit=crop&q=80&w=400",
    notes: "Responding to a cardiac arrest call. Expected back in 45 mins.",
  },
  {
    id: "3",
    ambulanceNumber: "CA-1109",
    driverName: "Mike Ross",
    driverPhone: "+94719876543",
    status: "Maintenance",
    fuelLevel: "10%",
    lastLocation: "Garage B",
    image_url: "https://images.unsplash.com/photo-1516515429572-11887ba78021?auto=format&fit=crop&q=80&w=400",
    notes: "Brake pad replacement in progress.",
  },
];

const AmbulanceManagementDummy = () => {
  const [selectedAmbulance, setSelectedAmbulance] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available": return "bg-green-100 text-green-700 border-green-300";
      case "on-mission": return "bg-blue-100 text-blue-700 border-blue-300";
      case "maintenance": return "bg-red-100 text-red-700 border-red-300";
      default: return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "available": return <CheckCircle className="w-4 h-4" />;
      case "on-mission": return <Navigation className="w-4 h-4 animate-pulse" />;
      case "maintenance": return <Wrench className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ambulance Fleet</h1>
        <p className="text-gray-500 mt-1">Real-time monitoring of emergency response vehicles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT SECTION - LIST */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl shadow-xl border p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600"/>
                Active Fleet List
            </h2>
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
              {DUMMY_AMBULANCES.map((ambulance) => (
                <div 
                    key={ambulance.id} 
                    className={`p-4 bg-white border rounded-2xl shadow-sm transition-all cursor-pointer hover:border-blue-400 ${selectedAmbulance?.id === ambulance.id ? 'ring-2 ring-blue-500 border-transparent' : ''}`}
                    onClick={() => setSelectedAmbulance(ambulance)}
                >
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={ambulance.image_url} alt="Ambulance" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <h3 className="font-bold text-xl text-gray-800">{ambulance.ambulanceNumber}</h3>
                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{ambulance.driverName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-3 min-w-[120px]">
                      <div className={`px-3 py-1 text-[10px] rounded-full border flex items-center gap-2 font-bold uppercase ${getStatusColor(ambulance.status)}`}>
                        {getStatusIcon(ambulance.status)}
                        {ambulance.status}
                      </div>
                      <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-bold flex items-center gap-1">
                        <Eye className="w-4 h-4"/> View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - DETAILS */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl border p-8 sticky top-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Info className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Details View</h3>
              </div>
              {selectedAmbulance && (
                <Button variant="ghost" size="icon" onClick={() => setSelectedAmbulance(null)} className="text-red-500 hover:bg-red-50 rounded-full">
                  <ArrowDownLeftFromCircle className="w-6 h-6" />
                </Button>
              )}
            </div>

            {!selectedAmbulance ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                <Truck className="w-10 h-10 mb-4 opacity-20" />
                <p>Select a unit to manage</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-4">
                    <img src={selectedAmbulance.image_url} className="w-full h-full object-cover" alt="Selected Unit" />
                    <div className="absolute top-2 right-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(selectedAmbulance.status)}`}>
                            {selectedAmbulance.status}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <label className="text-xs font-bold text-gray-400 uppercase">Primary Driver</label>
                    <p className="font-bold text-gray-800 text-lg">{selectedAmbulance.driverName}</p>
                    <div className="flex items-center gap-2 mt-2 text-blue-600">
                      <Phone className="w-4 h-4" />
                      <span className="font-semibold">{selectedAmbulance.driverPhone}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl">
                    <label className="text-xs font-bold text-gray-400 uppercase">Fuel Status</label>
                    <p className="font-bold text-gray-800 text-lg">{selectedAmbulance.fuelLevel}</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Live Tracking</label>
                    <div className="flex items-center gap-2 mt-1 p-3 border border-dashed rounded-xl">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-gray-600 font-medium">{selectedAmbulance.lastLocation}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <label className="text-xs font-bold text-gray-400 uppercase">Notes</label>
                    <p className="text-sm text-gray-600 mt-2 italic leading-relaxed">"{selectedAmbulance.notes}"</p>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                    <Button 
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 rounded-xl flex gap-2"
                    >
                        <Wrench className="w-4 h-4"/> Maintain Mode
                    </Button>
                    <Button 
                        variant="destructive" 
                        className="w-full font-bold h-12 rounded-xl flex gap-2"
                    >
                        <Trash2 className="w-4 h-4"/> Delete Unit
                    </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceManagementDummy;