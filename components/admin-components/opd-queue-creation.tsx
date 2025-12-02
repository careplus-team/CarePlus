"use client";
import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  ChevronDown, 
  Stethoscope,
} from 'lucide-react';
import { useRouter } from 'next/navigation';


 //up to now mock data
const DOCTORS = [
  { id: 1, name: "Dr. Sarah Wilson", spec: "Cardiologist", avatar: "SW" },
  { id: 2, name: "Dr. James Chen", spec: "Neurologist", avatar: "JC" },
  { id: 3, name: "Dr. Emily Brooks", spec: "Pediatrician", avatar: "EB" },
  { id: 4, name: "Dr. Michael Ross", spec: "General Surgeon", avatar: "MR" },
];

const TIME_SLOTS = [  
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "02:00 PM - 04:00 PM",
];

const InputGroup = ({ label, children, icon: Icon }: { label: string; children: React.ReactNode; icon: any }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
      {Icon && <Icon size={14} className="text-emerald-500" />}
      {label}
    </label>
    {children}
  </div>
);


export default function QueueCreation() {
  // Use the local mock router
  const router = useRouter(); 
  const [formData, setFormData] = useState({
    doctor: "",  
    timeSlot: "",
    slots: "00"
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    if (!formData.doctor || !formData.timeSlot) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // --- REDIRECT LOGIC ---
      const selectedDoctor = DOCTORS.find(d => d.id === Number(formData.doctor));
      const sessionData = {
          doctorName: selectedDoctor?.name || 'Unknown Doctor',
          specialty: selectedDoctor?.spec || 'N/A',
          avatar: selectedDoctor?.avatar || '?',
          timeSlot: formData.timeSlot,
          totalCapacity: Number(formData.slots),
      };
      
      
      // Store session data in localStorage to pass to the update page
      localStorage.setItem('opdSessionData', JSON.stringify(sessionData));
      router.push('/admin/OPD-Q-update'); 
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-indigo-50/30 font-sans text-slate-800 relative overflow-hidden flex flex-col items-center justify-center">
      
      {/* CarePlus Title in Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <h1 className="text-2xl font-bold text-emerald-600">CarePlus</h1>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-300/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-300/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-6xl px-6 flex flex-col items-center z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative w-full max-w-2xl">
          {/* Glowing Border Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-[2rem] blur opacity-20 transition duration-1000 group-hover:opacity-40"></div>
          
          <div className="relative w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100/50 flex items-center justify-between bg-gradient-to-r from-slate-50/50 to-white/50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Create OPD Session</h2>
                <p className="text-sm text-slate-500 mt-1">Manage doctor availability and patient slots</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                System Active
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="space-y-6">
                  <InputGroup label="Select Doctor" icon={Stethoscope}>
                    <div className="relative group">
                      <select 
                        className="w-full appearance-none bg-slate-50 hover:bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3 pr-10 transition-all outline-none cursor-pointer"
                        value={formData.doctor}
                        onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                      >
                        <option value="" disabled>Choose a specialist...</option>
                        {DOCTORS.map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.name} — {doc.spec}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </InputGroup>

                  {/* Doctor Card Preview */}
                  <div className={`p-4 rounded-xl border border-slate-100 bg-white/50 transition-all duration-300 ${formData.doctor ? 'opacity-100 translate-y-0' : 'opacity-50 grayscale translate-y-2'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                        {formData.doctor ? DOCTORS.find(d => d.id === Number(formData.doctor))?.avatar : "?"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">
                          {formData.doctor ? DOCTORS.find(d => d.id === Number(formData.doctor))?.name : "No Doctor Selected"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formData.doctor ? DOCTORS.find(d => d.id === Number(formData.doctor))?.spec : "Please select a doctor"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <InputGroup label="Select Time Slot" icon={Clock}>
                    <div className="relative group">
                      <select 
                        className="w-full appearance-none bg-slate-50 hover:bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3 pr-10 transition-all outline-none cursor-pointer"
                        value={formData.timeSlot}
                        onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                      >
                        <option value="" disabled>Choose time slot...</option>
                        {TIME_SLOTS.map((slot, i) => (
                          <option key={i} value={slot}>{slot}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </InputGroup>

                  <InputGroup label="Assignable Slots" icon={Users}>
                    <div className="relative">
                      <input 
                        type="number" 
                        className="w-full bg-slate-50 hover:bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3 pl-4 transition-all outline-none font-semibold"
                        value={formData.slots}
                        onChange={(e) => setFormData({...formData, slots: e.target.value})}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                        Patients
                      </div>
                    </div>
                  </InputGroup>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                 <button className="px-6 py-3 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all">
                    Cancel
                 </button>
                 <button 
                  onClick={handleSave}
                  disabled={isLoading || !formData.doctor || !formData.timeSlot}
                  className={`
                    relative overflow-hidden px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all active:scale-95
                    ${isLoading ? 'w-40 bg-emerald-600 cursor-wait' : 'w-32 bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-emerald-500/40 hover:-translate-y-0.5'}
                    ${(!formData.doctor) && !isLoading ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}
                  `}
                >
                  <span className={`flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                    Create OPD Session
                  </span>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                </button>
              </div>
            </div>
            
            {/* Bottom Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}