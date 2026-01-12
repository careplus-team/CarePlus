"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

/**
 * Ambulance type
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
  const [ambulances, setAmbulances] = useState<AmbulanceType[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch all ambulances
   */
  const fetchAmbulances = async () => {
    try {
      const res = await axios.get("/api/all-ambulance-get-api");

      if (res.data.success) {
        setAmbulances(res.data.data);
      } else {
        toast.error("Failed to load ambulances");
      }
    } catch {
      toast.error("API error while fetching ambulances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbulances();
  }, []);

  /**
   * Delete ambulance
   */
  const handleDeleteAmbulance = async (ambulanceId: number) => {
    const confirmed = confirm(
      "Are you sure you want to delete this ambulance?"
    );

    if (!confirmed) return;

    try {
      const res = await axios.post("/api/ambulance-delete-api", {
        id: ambulanceId,
      });

      if (res.data.success) {
        toast.success("Ambulance deleted successfully");

        // Remove from UI instantly
        setAmbulances((prev) =>
          prev.filter((a) => a.id !== ambulanceId)
        );
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch {
      toast.error("Error deleting ambulance");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Registered Ambulances
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your ambulance fleet
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-gray-500">
            Loading ambulances...
          </div>
        )}

        {/* Empty State */}
        {!loading && ambulances.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🚑</div>
            <h3 className="text-xl font-semibold">No ambulances found</h3>
            <p className="text-gray-600 mt-2">
              Register your first ambulance to get started.
            </p>
          </div>
        )}

        {/* Ambulance Grid */}
        {!loading && ambulances.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ambulances.map((ambulance) => (
              <div
                key={ambulance.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                {/* Image */}
                <div className="aspect-video bg-gray-100">
                  <img
                    src={ambulance.image_url}
                    alt={ambulance.license_plate}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {ambulance.license_plate}
                  </h3>
                  <p className="text-gray-600">
                    {ambulance.make} {ambulance.model}
                  </p>

                  <div className="mt-3 text-sm">
                    <span className="font-medium">Capacity:</span>{" "}
                    {ambulance.patient_capacity} patients
                  </div>

                  {/* Equipment */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-1">
                      Medical Equipment
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {ambulance.medical_equipment ? (
                        ambulance.medical_equipment
                          .split(",")
                          .map((eq, i) => (
                            <span
                              key={i}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md"
                            >
                              {eq.trim()}
                            </span>
                          ))
                      ) : (
                        <span className="text-gray-400 italic">
                          No equipment listed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() =>
                        handleDeleteAmbulance(ambulance.id)
                      }
                      className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition"
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
