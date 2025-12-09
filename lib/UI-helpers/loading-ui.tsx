import { Stethoscope } from "lucide-react";
import React from "react";

const LoadingUI = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700 h-screen">
      <div className="relative flex items-center justify-center">
        {/* Background Glow */}
        <div className="absolute w-24 h-24 bg-emerald-400/20 rounded-full blur-2xl animate-pulse"></div>

        {/* Spinner Base */}
        <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>

        {/* Spinner Active */}
        <div className="absolute w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>

        {/* Center Icon */}
        <Stethoscope size={24} className="absolute text-emerald-600" />
      </div>

      <div className="flex flex-col items-center gap-1">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          CarePlus
        </h2>
        <p className="text-sm font-medium text-slate-400 animate-pulse">
          Loading resources...
        </p>
      </div>
    </div>
  );
};

export default LoadingUI;
