"use client";

import { useState } from "react";
import axios from "axios";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "sonner";
import {
  Ambulance,
  Upload,
  CheckCircle,
  AlertTriangle,
  Users,
  Wrench,
  Camera,
  X,
  Save,
  Loader2,
  Truck,
  Plus} from "lucide-react";


export default function AmbulanceRegistration() {
  // State management for form data and UI
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formData, setFormData] = useState({
    license_plate: "",
    make: "",
    model: "",
    patient_capacity: "",
    medical_equipment: [] as string[]
  });

  // Equipment suggestions for autocomplete
  const equipmentSuggestions = [
    "Defibrillator", "Oxygen Tank", "Stretcher", "First Aid Kit",
    "Blood Pressure Monitor", "Pulse Oximeter", "Ventilator", "IV Equipment",
    "Spine Board", "Neck Brace", "Bandages", "Medications"
  ];

  // Handle input changes with validation
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle equipment addition/removal
  const addEquipment = (equipment: string) => {
    if (equipment.trim() && !formData.medical_equipment.includes(equipment.trim())) {
      setFormData(prev => ({
        ...prev,
        medical_equipment: [...prev.medical_equipment, equipment.trim()]
      }));
    }
  };

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medical_equipment: prev.medical_equipment.filter((_, i) => i !== index)
    }));
  };

  // Form validation
  const validateForm = () => {
    const required = ['license_plate', 'make', 'model', 'patient_capacity'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(', ')}`);
      return false;
    }

    if (!imageUrl) {
      toast.error("Please upload an ambulance photo");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        license_plate: formData.license_plate,
        make: formData.make,
        model: formData.model,
        patient_capacity: Number(formData.patient_capacity),
        medical_equipment: formData.medical_equipment.join(', '),
        image_url: imageUrl,
      };

      const response = await axios.post("/api/ambulance-registration-api", payload);

      if (response.data.success) {
        toast.success("s Ambulance registered successfully!", {
          description: "The ambulance has been added to your fleet.",
          duration: 5000
        });

        // Reset form
        setFormData({
          license_plate: "",
          make: "",
          model: "",
          patient_capacity: "",
          medical_equipment: []
        });
        setImageUrl("");
      } else {
        toast.error("Registration failed", {
          description: response.data.message || "Please try again"
        });
      }
    } catch (error) {
      toast.error("Network error", {
        description: "Please check your connection and try again"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl mb-6 shadow-2xl">
            <Ambulance className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Ambulance Registration
          </h1>
        </div>

        {/* Main Registration Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Plus className="w-6 h-6 mr-3" />
                Register New Ambulance
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Vehicle Information Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Truck className="w-6 h-6 text-red-500" />
                  <h3 className="text-xl font-semibold text-gray-900">Vehicle Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* License Plate */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                      License Plate *
                    </label>
                    <input
                      type="text"
                      value={formData.license_plate}
                      onChange={(e) => handleInputChange('license_plate', e.target.value.toUpperCase())}
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-200 text-lg font-mono"
                      placeholder="ABC-123"
                      required
                    />
                  </div>

                  {/* Make */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Make *</label>
                    <input
                      type="text"
                      value={formData.make}
                      onChange={(e) => handleInputChange('make', e.target.value)}
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-200 text-lg"
                      placeholder="Toyota"
                      required
                    />
                  </div>

                  {/* Model */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Model *</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-200 text-lg"
                      placeholder="HiAce"
                      required
                    />
                  </div>


                  {/* Patient Capacity */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      Patient Capacity *
                    </label>
                    <input
                      type="number"
                      value={formData.patient_capacity}
                      onChange={(e) => handleInputChange('patient_capacity', e.target.value)}
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-200 text-lg"
                      placeholder="4"
                      min="1"
                      max="20"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Medical Equipment Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Wrench className="w-6 h-6 text-purple-500" />
                  <h3 className="text-xl font-semibold text-gray-900">Medical Equipment</h3>
                </div>

                {/* Equipment Input */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      id="equipment-input"
                      className="flex-1 h-12 px-4 border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-200 text-lg"
                      placeholder="Add medical equipment..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          addEquipment(input.value);
                          input.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('equipment-input') as HTMLInputElement;
                        addEquipment(input.value);
                        input.value = '';
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Equipment Suggestions */}
                  <div className="flex flex-wrap gap-2">
                    {equipmentSuggestions.map((equipment) => (
                      <button
                        key={equipment}
                        type="button"
                        onClick={() => addEquipment(equipment)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-purple-100 hover:text-purple-700 transition-colors text-sm"
                      >
                        + {equipment}
                      </button>
                    ))}
                  </div>

                  {/* Selected Equipment */}
                  <div className="flex flex-wrap gap-2">
                    {formData.medical_equipment.map((equipment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 rounded-xl"
                      >
                        <span className="text-sm font-medium">{equipment}</span>
                        <button
                          type="button"
                          onClick={() => removeEquipment(index)}
                          className="text-purple-600 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Camera className="w-6 h-6 text-emerald-500" />
                  <h3 className="text-xl font-semibold text-gray-900">Vehicle Photo</h3>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                  {!imageUrl ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto">
                        <Camera className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">Upload Ambulance Photo</p>
                        <p className="text-gray-600">PNG, JPG up to 10MB</p>
                      </div>

                      <CldUploadWidget
                        uploadPreset="careplus"
                        options={{
                          sources: ["local", "url", "camera"],
                          clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
                          multiple: false,
                          folder: "ambulance_photos",
                          maxFiles: 1,
                          resourceType: "image",
                          maxFileSize: 10000000, // 10MB
                          tags: ["ambulance", "emergency", "vehicle"],
                        }}
                        onOpen={() => setUploadLoading(true)}
                        onSuccess={(result: any) => {
                          setImageUrl(result.info.secure_url);
                          setUploadLoading(false);
                          toast.success("Photo uploaded successfully!");
                        }}
                        onError={() => {
                          setUploadLoading(false);
                          toast.error("Upload failed. Please try again.");
                        }}
                      >
                        {({ open }) => (
                          <button
                            type="button"
                            onClick={() => open()}
                            disabled={uploadLoading}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                          >
                            {uploadLoading ? (
                              <div className="flex items-center">
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Uploading...
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Upload className="w-5 h-5 mr-2" />
                                Choose Photo
                              </div>
                            )}
                          </button>
                        )}
                      </CldUploadWidget>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={imageUrl}
                          alt="Ambulance"
                          className="w-32 h-32 object-cover rounded-2xl shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setImageUrl("")}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-green-600 font-medium flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Photo uploaded successfully
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Registering Ambulance...
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6 mr-3" />
                      Register Ambulance
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      
      </div>
    </div>
  );
}
