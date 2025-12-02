"use client";
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Activity, 
  CheckCircle2, 
  Save, 
  Minus, 
  Plus, 
  RefreshCw,
  ArrowLeft,
  Stethoscope,
  Play,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Type definition for the data passed from the previous screen
interface SessionData {
  doctorName: string;
  specialty: string;
  avatar: string;
  timeSlot: string;
  totalCapacity: number;
}

// Default data if none is provided (Fallback)
const defaultSessionData: SessionData = {
  doctorName: "Dr. Sarah Wilson",
  specialty: "Cardiologist",
  avatar: "SW",
  timeSlot: "09:00 AM - 12:00 PM",
  totalCapacity: 40
};

export default function OPDUpdateQueue({ initialData }: { initialData?: SessionData }) {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData>(initialData || defaultSessionData);
  const [currentQueue, setCurrentQueue] = useState(0);
  const [totalCapacity, setTotalCapacity] = useState(initialData?.totalCapacity || defaultSessionData.totalCapacity);

  // Load session data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem('opdSessionData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setSessionData(parsedData);
        // Update totalCapacity with the loaded data
        setTotalCapacity(parsedData.totalCapacity);
      } catch (e) {
        console.error('Error parsing session data:', e);
      }
    }
  }, []);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSystemActive, setIsSystemActive] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);

  // Derived calculations
  const remainingSlots = Math.max(0, totalCapacity - currentQueue);
  const progressPercentage = Math.min(100, (currentQueue / totalCapacity) * 100);

  // Color helpers
  const getRingColor = () => {
    if (progressPercentage < 50) return 'text-emerald-500';
    if (progressPercentage < 80) return 'text-amber-500';
    return 'text-rose-500';
  };

  const handleUpdate = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-indigo-50/30 font-sans text-slate-800 relative overflow-hidden flex flex-col items-center justify-center">
        
        {/* CarePlus Title - Fixed Top Left */}
        <div className="absolute top-6 left-6 z-20">
          <h1 className="text-2xl font-bold text-emerald-600">CarePlus</h1>
        </div>

        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-300/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-300/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <div className="w-full max-w-4xl relative z-10 animate-in fade-in zoom-in-95 duration-500 px-4">
            
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => router.back()} 
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors group"
                  >
                      <div className="bg-white p-2 rounded-full shadow-sm border border-slate-200 group-hover:border-emerald-300 group-hover:text-emerald-600 transition-all">
                          <ArrowLeft className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-sm">End Session</span>
                  </button>
                  <button 
                    onClick={() => setSessionStarted(true)} 
                    disabled={sessionStarted}
                    className={`flex items-center gap-2 transition-colors group ${sessionStarted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                      <div className={`bg-white p-2 rounded-full shadow-sm border transition-all ${
                        sessionStarted 
                          ? 'border-emerald-300 text-emerald-600' 
                          : 'border-slate-200 group-hover:border-emerald-300 group-hover:text-emerald-600'
                      }`}>
                          <Play className="w-5 h-5" />
                      </div>
                      <span className={`font-semibold text-sm ${sessionStarted ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-800'}`}>
                        {sessionStarted ? 'Session Active' : 'Start Session'}
                      </span>
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                    <span className={`w-2 h-2 rounded-full ${isSystemActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {isSystemActive ? 'Live Updates On' : 'Updates Paused'}
                    </span>
                </div>
            </div>

            {/* MAIN DASHBOARD CARD */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
                
                {/* Header Section */}
                <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-200">
                                {sessionData.avatar}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-current" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{sessionData.doctorName}</h2>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                                <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                                    <Stethoscope className="w-3 h-3" /> {sessionData.specialty}
                                </span>
                                <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                                    <Clock className="w-3 h-3" /> {sessionData.timeSlot}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button 
                      onClick={() => setIsSystemActive(!isSystemActive)}
                      className={`p-3 rounded-xl transition-all ${isSystemActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                    >
                      <Activity className="w-6 h-6" />
                    </button>
                </div>

                {/* Dashboard Controls */}
                <div className="p-8 md:p-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    
                    {/* LEFT: Circular Progress Visualizer */}
                    <div className="relative flex-shrink-0">
                        <div className="w-72 h-72 md:w-80 md:h-80 relative flex items-center justify-center">
                            {/* Glow Effect */}
                            <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-colors duration-700 ${getRingColor().replace('text-', 'bg-')}`} />
                            
                            {/* SVG Ring */}
                            <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
                                <circle cx="50%" cy="50%" r="46%" stroke="currentColor" strokeWidth="20" fill="transparent" className="text-slate-100" />
                                <circle 
                                    cx="50%" cy="50%" r="46%" 
                                    stroke="currentColor" strokeWidth="20" 
                                    fill="transparent" 
                                    strokeDasharray="289%" 
                                    strokeDashoffset={`${289 * (1 - progressPercentage / 100)}%`}
                                    className={`transition-all duration-1000 ease-out ${getRingColor()}`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            
                            {/* Center Data */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Token No</span>
                                <div className="text-8xl md:text-9xl font-bold text-slate-800 tracking-tighter tabular-nums leading-none">
                                    {currentQueue}
                                </div>
                                <div className="mt-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">
                                    <div className={`w-2 h-2 rounded-full ${remainingSlots > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    <span className="text-sm font-semibold text-slate-600">{remainingSlots} Remaining</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Buttons and Sliders */}
                    <div className="flex-1 w-full space-y-8">
                        <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-700">Update Queue</h3>
                                <button 
                                    onClick={() => setCurrentQueue(0)} 
                                    className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full hover:bg-emerald-100 transition-colors"
                                >
                                    RESET
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <button 
                                    onClick={() => setCurrentQueue(prev => Math.max(0, prev - 1))} 
                                    disabled={!sessionStarted || currentQueue <= 0}
                                    className={`w-20 h-20 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center transition-all shadow-sm ${
                                      !sessionStarted 
                                        ? 'opacity-50 cursor-not-allowed text-slate-300' 
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 active:scale-95'
                                    }`}
                                >
                                    <Minus className="w-8 h-8" />
                                </button>
                                
                                <div className="flex-1 h-20 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden">
                                    <span className="text-xl font-medium text-slate-500">Current</span>
                                </div>
                                
                                <button 
                                    onClick={() => setCurrentQueue(prev => Math.min(totalCapacity, prev + 1))} 
                                    disabled={!sessionStarted || currentQueue >= totalCapacity}
                                    className={`w-20 h-20 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-200 flex items-center justify-center transition-all ${
                                      !sessionStarted 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : 'active:scale-95 hover:bg-emerald-700'
                                    } disabled:opacity-50`}
                                >
                                    <Plus className="w-10 h-10" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="bg-slate-50 p-6 md:px-12 md:py-8 border-t border-slate-100 flex items-center justify-center">
                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Live Sync Active
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}