'use client';
import React, { useState } from 'react';
import { 
  Stethoscope, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Play, 
  Square, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';

export default function ChannelVisitedPatientUpdate() {
  // State for session management
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Mock Data
  const doctor = {
    name: "Dr. Sarah Bennett",
    specialty: "Senior Cardiologist",
    hospital: "St. Mary's General Hospital",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop",
    gender: "Female",
    experience: "12 Years",
    qualification: "MBBS, MD",
  };

  const patient = {
    name: "James Anderson",
    age: 49,
    id: "197022356721",
    phone: "071 187 3570",
    email: "jamesanderson@123.com",
    image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop",
    // The specially highlighted note
    medicalNote: "Patient reports acute chest pain post-exercise. History of hypertension. Allergic to Penicillin."
  };

  const slots = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    time: `${(9 + (i % 12))}:${i < 12 ? '00' : '30'} ${i < 12 ? 'AM' : 'PM'}`,
    status: i === 0 ? 'current' : i < 3 ? 'completed' : 'pending'
  }));

  return (
    <div className="h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-100 selection:text-teal-900 p-4 md:p-4 lg:p-6 overflow-hidden flex flex-col">
      
      {/* CarePlus Title Top Left */}
      <div className="absolute top-4 left-4 z-20">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 font-bold text-2xl">
          <a href="/">CarePlus</a>
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 items-stretch pt-8">
        
        {/* DOCTOR INFO */}
        <div className="lg:col-span-3 flex">
          <div className="bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative group hover:shadow-2xl transition-all duration-300 w-full flex flex-col">
            {/* Decorative Header */}
            <div className="h-20 bg-gradient-to-br from-teal-600 to-teal-800 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-10">
                 <Stethoscope size={80} className="text-white transform rotate-12 translate-x-4 -translate-y-4" />
               </div>
            </div>
            
            {/* Avatar */}
            <div className="px-4 relative">
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <div className="p-1 bg-white rounded-full shadow-lg">
                  <img 
                    src={doctor.image} 
                    alt="Doctor" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-50"
                  />
                </div>
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" title="Online"></div>
              </div>
            </div>

            {/* Info */}
            <div className="pt-12 pb-3 px-3 text-center flex-1 flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 mb-0.5 truncate">{doctor.name}</h2>
              <p className="text-teal-600 font-medium text-xs mb-2">{doctor.specialty}</p>
              
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-1.5 mb-2 text-[10px]">
                <div className="bg-slate-50 py-1.5 px-2 rounded-lg">
                  <span className="text-slate-400 block">Gender</span>
                  <span className="text-slate-700 font-semibold">{doctor.gender}</span>
                </div>
                <div className="bg-slate-50 py-1.5 px-2 rounded-lg">
                  <span className="text-slate-400 block">Experience</span>
                  <span className="text-slate-700 font-semibold">{doctor.experience}</span>
                </div>
              </div>
              
              <div className="bg-teal-50 py-1.5 px-2 rounded-lg mb-2 text-[10px]">
                <span className="text-teal-600 font-semibold">{doctor.qualification}</span>
              </div>
              
              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[10px] bg-slate-50 py-1.5 rounded-lg">
                <MapPin size={10} />
                <span className="truncate">{doctor.hospital}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS  */}
        <div className="lg:col-span-4 flex">
          <div className="bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-5 flex flex-col justify-center items-center relative overflow-hidden w-full">
            
            {/* Dynamic Background Pulse when Active */}
            <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${isSessionActive ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-300 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
            </div>

            <div className="z-10 w-full max-w-xs flex flex-col items-center gap-5">
              
              {/* Status Indicator */}
              <div className="text-center">
                 <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300
                   ${isSessionActive 
                     ? 'bg-green-100 text-green-700 shadow-lg shadow-green-100 ring-2 ring-green-500/20' 
                     : 'bg-slate-100 text-slate-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isSessionActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                    {isSessionActive ? 'Session Live' : 'Ready to Start'}
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                <button 
                  onClick={() => setIsSessionActive(true)}
                  disabled={isSessionActive}
                  className={`group relative w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-base transition-all duration-300 shadow-lg
                    ${isSessionActive 
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none scale-95' 
                      : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-teal-200 hover:-translate-y-1 hover:shadow-xl'}`}
                >
                  <div className={`p-0.5 rounded-full ${isSessionActive ? 'bg-slate-200' : 'bg-white/20'}`}>
                    <Play size={16} className={isSessionActive ? 'text-slate-400' : 'fill-current'} />
                  </div>
                  Start Session
                </button>

                <button 
                  onClick={() => setIsSessionActive(false)}
                  disabled={!isSessionActive}
                  className={`group relative w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-base transition-all duration-300 shadow-lg
                    ${!isSessionActive 
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none scale-95' 
                      : 'bg-white border-2 border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 hover:shadow-rose-100 hover:-translate-y-1 hover:shadow-xl'}`}
                >
                   <div className={`p-0.5 rounded-full ${!isSessionActive ? 'bg-slate-200' : 'bg-rose-100'}`}>
                    <Square size={16} className={!isSessionActive ? 'text-slate-400' : 'fill-current'} />
                  </div>
                  End Session
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* PATIENT INFO  */}
        <div className="lg:col-span-5 flex">
           <div className="bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-4 md:p-5 relative overflow-hidden w-full">
              
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row gap-4 items-start relative z-10">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-lg shrink-0 border-2 border-white ring-1 ring-slate-100">
                  <img src={patient.image} alt="Patient" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md uppercase tracking-wide">ID: {patient.id}</span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-slate-500 text-sm font-medium">{patient.age} Years Old</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 mt-2">
                    <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <Phone size={14} className="text-blue-500" />
                      <span className="text-xs font-medium">{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <Mail size={14} className="text-blue-500" />
                      <span className="text-xs font-medium truncate">{patient.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* HIGHLIGHTED NOTE CARD */}
              <div className="mt-4">
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 relative overflow-hidden">
                   {/* Accent Bar */}
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                   
                   <div className="flex items-start gap-3">
                     <div className="bg-white p-1.5 rounded-full shadow-sm text-amber-500 shrink-0">
                       <AlertCircle size={16} />
                     </div>
                     <div>
                       <h4 className="font-bold text-amber-800 uppercase text-[10px] tracking-wider mb-1">Critical Medical Attention</h4>
                       <p className="text-slate-700 leading-relaxed text-sm font-medium">
                         {patient.medicalNote}
                       </p>
                     </div>
                   </div>
                </div>
                
                {/* Previous History Mini List */}
                <div className="mt-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Vitals</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 p-2 rounded-lg text-center">
                       <span className="block text-[10px] text-slate-400 mb-0.5">BPM</span>
                       <span className="block font-bold text-sm text-slate-700">88</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg text-center">
                       <span className="block text-[10px] text-slate-400 mb-0.5">Weight</span>
                       <span className="block font-bold text-sm text-slate-700">72kg</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg text-center">
                       <span className="block text-[10px] text-slate-400 mb-0.5">Temp</span>
                       <span className="block font-bold text-sm text-slate-700">98.4°</span>
                    </div>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* SLOTS */}
      <div className="max-w-[1600px] mx-auto w-full flex-1">
        <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 h-full">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-teal-600" />
            <span className="font-bold text-slate-700">Today's Queue</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full ml-2">Dec 09, 2025</span>
          </div>
          
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {slots.map((slot) => (
              <div 
                key={slot.id}
                className={`
                  relative group p-2 rounded-lg border-2 transition-all duration-300 cursor-pointer aspect-square flex items-center justify-center
                  ${slot.status === 'current' 
                    ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-200' 
                    : slot.status === 'completed'
                      ? 'bg-slate-50 border-slate-100 opacity-60 grayscale hover:grayscale-0'
                      : 'bg-white border-slate-100 hover:border-teal-300 hover:shadow-md'
                  }
                `}
              >
                {/* Top right indicator */}
                <div className="absolute top-1 right-1">
                  {slot.status === 'completed' && <div className="w-2 h-2 bg-teal-500 rounded-full"></div>}
                  {slot.status === 'current' && <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>}
                  {slot.status === 'pending' && <div className="w-2 h-2 bg-slate-300 rounded-full"></div>}
                </div>
                
                {/* Centered number */}
                <span className={`text-xl font-bold ${slot.status === 'current' ? 'text-white' : 'text-slate-600'}`}>
                  {String(slot.id).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}