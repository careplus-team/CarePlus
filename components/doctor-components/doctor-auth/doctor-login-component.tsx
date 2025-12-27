"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import {
  Stethoscope,
  Heart,
  Shield,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Activity,
  Users,
  Award,
  Clock,
  CheckCircle,
  Star,
  Sparkles,
} from "lucide-react";

const DoctorLoginComponent = () => {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [initChecked, setInitChecked] = useState(true);

  const checkAuth = async () => {
    console.log("Checking auth session");
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("Current user:", user);
    if (user) {
      // Check if user is a doctor
      try {
        const response = await axios.post("/api/doctor-details-get-api", {
          email: user.email,
        });
        console.log("Auth check response:", response);
        if (response.data.success) {
          const doctorProfile = response.data.data;
          console.log("Doctor Profile:", doctorProfile);
          router.push("/doctor/doctor-dashboard");
          console.log("user is a doctor, redirecting to dashboard");
        }
      } catch (error) {
        // User is logged in but not a doctor, sign out
        await supabase.auth.signOut();
      }
    }
    setInitChecked(false);
  };

  // Check if already logged in
  useEffect(() => {
    console.log("Checking existing auth session");

    checkAuth();
  }, []);

  //handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Login Failed", {
          description: error.message,
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      // Verify doctor status
      const response = await axios.post("/api/doctor-details-get-api", {
        email,
      });
      if (response.data.success) {
        toast.success("Welcome back, Doctor! 👨‍⚕️", {
          description: "Redirecting to your dashboard...",
          duration: 3000,
        });

        // Add a small delay for better UX
        setTimeout(() => {
          router.push("/doctor/doctor-dashboard");
          console.log("redirecting to doctor dashboard");
        }, 1500);
      } else {
        await supabase.auth.signOut();
        toast.error("Access Denied", {
          description:
            "This account is not registered as a doctor. Please contact administration.",
          duration: 6000,
        });
      }
    } catch (error) {
      toast.error("Connection Error", {
        description: "Please check your internet connection and try again.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="relative z-10 flex min-h-screen">
        {/* Left Panel - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
            {/* Logo and Branding */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-lg rounded-3xl mb-8 shadow-2xl">
                <Stethoscope className="w-12 h-12" />
              </div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                CarePlus
              </h1>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Doctor Portal
              </h1>
              <p className="text-xl text-blue-100 font-medium">
                Healthcare Excellence at Your Fingertips
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                CarePlus
              </h1>
              <p className="text-gray-600">Doctor Portal</p>
            </div>

            {/* Login Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-8 lg:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mb-6 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600">Sign in to your doctor account</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    Email Address
                  </label>
                  <div className="relative">
                    <Input
                      disabled={initChecked || loading}
                      type="email"
                      placeholder="doctor@careplus.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-4 pr-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 text-lg bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-gray-500" />
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      disabled={initChecked || loading}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-4 pr-12 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 text-lg bg-gray-50/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    onClick={() => router.push("/doctor/reset-password")}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={loading || initChecked}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {initChecked ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Checking Session...
                    </div>
                  ) : loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Sign In
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="mt-8 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">
                      New to CarePlus?
                    </span>
                  </div>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <button
                  onClick={() => router.push("/doctor/doctor-registration")}
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  Register as a Doctor →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLoginComponent;
