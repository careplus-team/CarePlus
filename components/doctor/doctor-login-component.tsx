"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";

const DoctorLogin = () => {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    // Authenticate using supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    //Fetch doctor profile from backend api
    try {
      const response = await axios.post("/api/doctor-details-get-api", { email });
      if (response.data.success) {
        const doctorProfile = response.data.data;
        console.log("Doctor Profile:", doctorProfile);
        //Redirect to doctor dashboard if the profile exists
        //router.push("/doctor/dashboard");
        console.log("redirect to doctor dashboard");
      } else {
        await supabase.auth.signOut();
        toast.error('this account is not registered as a doctor');
        router.push("/login")
      }
    } catch (err) {
      toast.error("Failed to verify doctor profile");
      await supabase.auth.signOut();
      router.push("/login");
    } finally {
      setLoading(false);
    }
    // check whether the user is a doctor 
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Input
        placeholder="Doctor Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2"
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4"
      />
      <Button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
    </div>
  );
};

export default DoctorLogin;
