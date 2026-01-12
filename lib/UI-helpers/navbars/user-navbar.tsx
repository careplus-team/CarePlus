"use client";
import React, { useEffect, useTransition } from "react";
import { DashboardNavbar } from "./navbar-template";
import {
  Activity,
  ClipboardMinus,
  History,
  UserRoundSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

const UserNavbar = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDoctor, setIsDoctor] = React.useState(false);

  const fetchUserInfoFromAuth = () => {
    startTransition(async () => {
      const client = createClient();
      const { data, error } = await client.auth.getUser();
      console.log("user auth info", data);

      if (data?.user?.email != null) {
        console.log("hree", data.user.email);
        getUserInfoFromDb(data.user.email);
      }
    });
  };

  const getUserInfoFromDb = (email: any) => {
    startTransition(async () => {
      const client = createClient();
      console.log("used mail", email);
      const dbUserInfo = await client
        .from("user")
        .select("*")
        .eq("email", email);
      if (dbUserInfo.data) {
        if (dbUserInfo.data?.length <= 0) {
          const doctorInfor = await axios.post("/api/doctor-details-get-api", {
            email,
          });
          setIsDoctor(true);
        } else {
          setIsDoctor(false);
          console.log(dbUserInfo);
        }
      } else {
        toast.error("Error fetching user data from database");
        return;
      }
    });
  };

  useEffect(() => {
    fetchUserInfoFromAuth();
  }, []);

  return (
    <DashboardNavbar brandName="CarePlus">
      {/* These buttons appear on the right on Desktop, and inside the drawer on Mobile */}
      <Button onClick={() => router.push("/my-lab-reports")} variant="ghost">
        <ClipboardMinus /> My Reports
      </Button>
      <Button variant="ghost">
        <History />
        Chaneling Historys
      </Button>

      {isPending ? (
        <Button variant="ghost">
          <UserRoundSearch />
          Loading...
        </Button>
      ) : isDoctor ? null : (
        <Button onClick={() => router.push("/profile")} variant="ghost">
          <UserRoundSearch />
          My Profile
        </Button>
      )}
    </DashboardNavbar>
  );
};

export default UserNavbar;
