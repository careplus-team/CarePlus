"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

/**
 * Interface defining the structure of an ambulance object
 * Contains all the essential information about an ambulance unit
 */
interface AmbulanceType {
  id: number;
  license_plate: string;
  make: string;
  model: string;
  patient_capacity: number;
  medical_equipment: string;
  image_url: string;
}


export default function AllAmbulancesPage() {
  // State management for ambulance data and loading status
  const [ambulances, setAmbulances] = useState<AmbulanceType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetches all ambulance data from the API endpoint
   
  async function fetchAmbulances() {
    try {
      const res = await axios.get("/api/all-ambulance-get-api");

      if (res.data.success) {
        setAmbulances(res.data.data);
      } else {
        toast.error("Failed to load ambulances");
      }
    } catch (err) {
      toast.error("API error while fetching ambulances");
    } finally {
      setLoading(false);
    }
  }

  // Fetch ambulances on component mount
  useEffect(() => {
    fetchAmbulances();
  }, []);

  /**
   * Handles the deletion of an ambulance (placeholder for future implementation)
   * Currently shows a notification that the feature is not yet implemented
   */
  const handleDeleteAmbulance = (ambulanceId: number) => {
    toast.error("Delete functionality not implemented yet");
  };

 


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Registered Ambulances 
          </h1>
        
        </div>

        {/* Fleet Statistics */}
        {!loading && ambulances.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-2xl font-bold text-gray-900">{ambulances.length}</div>
              <div className="text-sm text-gray-600">Total Ambulances</div>
            </div>
            
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && ambulances.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🚑</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Ambulances Registered
              </h3>
              <p className="text-gray-600 mb-6">
                There are currently no ambulance units registered in the system.
                Register your first ambulance to get started with fleet management.
              </p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Register First Ambulance
              </button>
            </div>
          </div>
        )}

        {/* Ambulance Grid */}
        {!loading && ambulances.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ambulances.map((ambulance) => (
              <div
                key={ambulance.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Ambulance Image */}
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={ambulance.image_url}
                    alt={`${ambulance.make} ${ambulance.model}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/400/300?text=No+Image';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                </div>

                {/* Ambulance Information */}
                <div className="p-6">
                  {/* License Plate and Basic Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {ambulance.license_plate}
                    </h3>
                    <p className="text-gray-600 font-medium">
                      {ambulance.make} {ambulance.model}
                    </p>
                  </div>

                  {/* Capacity Information */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Patient Capacity</span>
                      <span className="font-semibold text-gray-900">
                        {ambulance.patient_capacity} patients
                      </span>
                    </div>
                  </div>

                  {/* Medical Equipment */}
                  <div className="mb-6">
                    <div className="text-sm text-gray-600 mb-2">Medical Equipment</div>
                    <div className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3 min-h-[60px]">
                      {ambulance.medical_equipment ? (
                        <div className="flex flex-wrap gap-1">
                          {ambulance.medical_equipment.split(',').map((equipment, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md"
                            >
                              {equipment.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">No equipment listed</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    

                    
                    <button
                      onClick={() => handleDeleteAmbulance(ambulance.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button> 

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

       
        
      </div>
    </div>
  );
}
