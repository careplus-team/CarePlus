"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LoadingUI from "@/lib/UI-helpers/loading-ui";

// Dynamic import for Leaflet map to avoid SSR issues
const MiniMap = dynamic(() => import("./MiniMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">
      Loading Map...
    </div>
  ),
});

// Matches API response structure
interface EmergencyRequest {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
}

interface Ambulance {
  id: string;
  license_plate: string;
  make: string;
  model: string;
  patient_capacity: number;
  medical_equipment: string;
  image_url: string;
  availbility: string;
  created_at: string;
  active_request?: EmergencyRequest;
}

const AmbulanceManagementDummy = () => {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      const res = await fetch("/api/all-ambulance-get-api");
      const result = await res.json();
      if (result.success) {
        setAmbulances(result.data);
      } else {
        console.error("Failed to fetch ambulances:", result.message);
      }
    } catch (error) {
      console.error("Error fetching ambulances:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenanceMode = async (ambulance: Ambulance) => {
    setUpdating(true);
    const newStatus =
      ambulance.availbility === "Maintenance" ? "Available" : "Maintenance";

    try {
      const res = await fetch("/api/ambulance-update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ambulance.id, status: newStatus }),
      });
      const result = await res.json();

      if (result.success) {
        // Update local state
        const updatedList = ambulances.map((amb) =>
          amb.id === ambulance.id ? { ...amb, availbility: newStatus } : amb
        );
        setAmbulances(updatedList);
        // Also update selected item if it matches
        if (selectedAmbulance?.id === ambulance.id) {
          setSelectedAmbulance({
            ...selectedAmbulance,
            availbility: newStatus,
          });
        }
      } else {
        alert("Failed to update status: " + result.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAmbulance = async () => {
    if (!deletingId) return;
    
    try {
      const res = await fetch("/api/ambulance-delete-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingId }),
      });
      const result = await res.json();

      if (result.success) {
        setAmbulances(ambulances.filter((amb) => amb.id !== deletingId));
        if (selectedAmbulance?.id === deletingId) {
          setSelectedAmbulance(null);
        }
        setIsDeleteDialogOpen(false);
        setDeletingId(null);
      } else {
        alert("Failed to delete ambulance: " + result.message);
      }
    } catch (error) {
      console.error("Error deleting ambulance:", error);
      alert("Error deleting ambulance");
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-700 border-green-300";
      case "on-mission":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "maintenance":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return <CheckCircle className="w-4 h-4" />;
      case "on-mission":
        return <Navigation className="w-4 h-4 animate-pulse" />;
      case "maintenance":
        return <Wrench className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingUI />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-8 mt-2 md:flex md:items-end md:justify-between">
          <div className=" absolute top-4 left-4 ">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500  to-green-500 font-bold  text-2xl">
          <a href="/">CarePlus</a>
        </p>
      </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Ambulance Fleet
          </h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Real-time monitoring and dispatch management.
          </p>
        </div>
     
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT SECTION - LIST */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              Active Fleet List
              <span className="ml-auto text-xs font-normal text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                {ambulances.length} Units
              </span>
            </h2>
            
            <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto p-1 pr-2 custom-scrollbar">
              {ambulances.map((ambulance) => (
                <div
                  key={ambulance.id}
                  className={`group relative p-4 md:p-5 bg-white border rounded-2xl shadow-sm transition-all duration-200 cursor-pointer 
                    ${selectedAmbulance?.id === ambulance.id 
                        ? "ring-2 ring-blue-500 border-transparent shadow-md bg-blue-50/10" 
                        : "hover:border-blue-300 hover:shadow-md"
                    }`}
                  onClick={() => setSelectedAmbulance(ambulance)}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    
                    {/* Image Section */}
                    <div className="relative w-full sm:w-32 h-48 sm:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
                      <img
                        src={ambulance.image_url || "/amb-default.avif"}
                        alt="Ambulance"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent sm:hidden"/>
                      <div className="absolute top-2 right-2 sm:hidden">
                         <span className={`px-2 py-1 rounded text-[10px] font-bold border shadow-sm ${getStatusColor(ambulance.availbility)}`}>
                            {ambulance.availbility}
                         </span>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg md:text-xl text-gray-900 tracking-tight">
                                {ambulance.license_plate}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                <span className="font-medium text-gray-700">{ambulance.make} {ambulance.model}</span>
                            </div>
                        </div>
                        {/* Status Badge (Desktop) */}
                        <div className="hidden sm:block text-right">
                             <div className={`px-3 py-1.5 text-[10px] md:text-xs rounded-full border flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider ${getStatusColor(ambulance.availbility)}`}>
                                {getStatusIcon(ambulance.availbility)}
                                {ambulance.availbility || "Unknown"}
                            </div>
                        </div>
                      </div>

                      {/* Active Request Card */}
                      {ambulance.active_request && (
                        <div className="mt-4 overflow-hidden rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-white shadow-sm ring-1 ring-red-100/50">
                          <div className="p-3">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                                <p className="text-xs font-bold text-red-600 uppercase tracking-wide">
                                  Live Emergency Mission
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Map Preview */}
                                <div
                                    className="h-28 w-full sm:w-40 shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative z-0"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MiniMap
                                    lat={ambulance.active_request.latitude}
                                    lng={ambulance.active_request.longitude}
                                    />
                                </div>
                                
                                {/* Location Details */}
                                <div className="flex-1 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Target Location</p>
                                        <div className="flex items-center gap-2 text-xs font-mono text-gray-600 bg-white p-1.5 rounded border border-dashed border-gray-200">
                                            <span>Lat: {ambulance.active_request.latitude.toFixed(4)}</span>
                                            <span className="text-gray-300">|</span>
                                            <span>Lng: {ambulance.active_request.longitude.toFixed(4)}</span>
                                        </div>
                                    </div>
                                    <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full mt-2 sm:mt-0 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                                    onClick={() =>
                                        window.open(
                                        `https://www.google.com/maps/search/?api=1&query=${ambulance.active_request?.latitude},${ambulance.active_request?.longitude}`,
                                        "_blank"
                                        )
                                    }
                                    >
                                    <MapPin className="w-3 h-3 mr-1.5" />
                                    Open in Google Maps
                                    </Button>
                                </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {ambulances.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed">
                    <Truck className="w-12 h-12 mb-3 opacity-20" />
                  <p>No ambulances found active in the fleet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - DETAILS */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className={`bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 transition-all duration-300 ${selectedAmbulance ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-100'} sticky top-6`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <Info className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Unit Details
                </h3>
              </div>
              {selectedAmbulance && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedAmbulance(null)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <ArrowDownLeftFromCircle className="w-6 h-6" />
                </Button>
              )}
            </div>

            {!selectedAmbulance ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Truck className="w-8 h-8 opacity-30" />
                </div>
                <p className="font-medium">Select a unit to manage details</p>
                <p className="text-sm opacity-60 mt-1">Click on any ambulance card from the list</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Hero Image */}
                <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-6 shadow-md group">
                  <img
                    src={selectedAmbulance.image_url || "/amb-default.avif"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    alt="Selected Unit"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"/>
                  <div className="absolute bottom-4 left-4 text-white">
                     <p className="text-xs opacity-80 uppercase tracking-widest mb-1">Ambulance ID</p>
                     <p className="text-2xl font-bold font-mono tracking-tight">{selectedAmbulance.license_plate}</p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border shadow-lg backdrop-blur-md ${getStatusColor(
                        selectedAmbulance.availbility
                      )}`}
                    >
                      {selectedAmbulance.availbility || "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      Vehicle Information
                    </label>
                    <div className="flex items-center justify-between mt-2">
                        <p className="font-bold text-gray-800 text-lg">
                        {selectedAmbulance.make} <span className="font-normal text-gray-600">{selectedAmbulance.model}</span>
                        </p>
                         <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-md border text-sm text-gray-600 shadow-sm">
                            <User className="w-3.5 h-3.5 text-blue-500" />
                            <span className="font-semibold">{selectedAmbulance.patient_capacity}</span>
                        </div>
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      Medical Capabilities
                    </label>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {selectedAmbulance.medical_equipment.split(',').map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-white border rounded-full text-sm font-medium text-gray-600 shadow-sm">
                                {item.trim()}
                            </span>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t space-y-3">
                  <Button
                    onClick={() => toggleMaintenanceMode(selectedAmbulance)}
                    disabled={updating}
                    className={`w-full font-bold h-12 rounded-xl flex gap-2 text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      selectedAmbulance.availbility === "Maintenance"
                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-200"
                        : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-200"
                    }`}
                  >
                    <Wrench className="w-4 h-4" />
                    {updating
                      ? "Updating Status..."
                      : selectedAmbulance.availbility === "Maintenance"
                      ? "Mark as Operational"
                      : "Send to Maintenance"}
                  </Button>
                  
                  {/* Additional Actions */}
                  <div className="grid grid-cols-2 gap-3">
               
                     <Button
                        variant="ghost"
                        className={`h-10 rounded-xl flex items-center justify-center gap-2 border transition-all duration-200 ${
                            selectedAmbulance.availbility === "Maintenance" || selectedAmbulance.availbility === "On-Mission"
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                : "bg-white text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm"
                        }`}
                        onClick={() => confirmDelete(selectedAmbulance.id)}
                        disabled={selectedAmbulance.availbility === "Maintenance" || selectedAmbulance.availbility === "On-Mission"}
                    >
                        <Trash2 className="w-4 h-4" />
                        {selectedAmbulance.availbility === "Maintenance" || selectedAmbulance.availbility === "On-Mission" 
                            ? "Cannot Delete" 
                            : "Decommission Unit"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the ambulance
              from the fleet and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAmbulance} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AmbulanceManagementDummy;
