"use client";
import { createClient } from "@/lib/supabase/client";
import React, { useEffect } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const HomeComponent = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [dbUserInfo, setDbUserInfo] = React.useState<any>(null);
  const getUserInfoFromDb = async (email: any) => {
    const client = createClient();
    console.log("used mail", email);
    const dbUserInfo = await client.from("user").select("*").eq("email", email);
    setDbUserInfo(dbUserInfo.data ? dbUserInfo.data[0] : null);
    console.log(dbUserInfo);
  };
  const fetchUserInfoFromAuth = async () => {
    const client = createClient();
    const userAuthInfo = await client.auth.getClaims();
    setUserInfo(userAuthInfo);
    console.log("haree1");
    if (userAuthInfo?.data?.claims?.email != null) {
      console.log("hree", userAuthInfo?.data?.claims?.email);
      getUserInfoFromDb(userAuthInfo?.data?.claims?.email);
    }
  };

  const handleLogout = () => {
    startTransition(async () => {
      const client = createClient();
      const { error } = await client.auth.signOut();
      if (!error) {
        router.push("/login");
      }
    });
  };

  useEffect(() => {
    fetchUserInfoFromAuth();
  }, []);
  console.log(userInfo);
  return (
    <div className="max-w-xs mx-auto mt-10 p-6 rounded-xl shadow-lg bg-white text-center font-sans">
      <Image
        src={dbUserInfo?.profilePicture || "/loading.gif"}
        alt="Profile Picture"
        width={100}
        height={100}
        className="rounded-full mb-4 mx-auto"
      />
      <h2 className="text-xl font-semibold mb-2">
        {dbUserInfo?.name || "Loading..."}
      </h2>
      <p className="text-gray-600 mb-1">
        <strong>Email:</strong> {userInfo?.data?.claims?.email || "Loading..."}
      </p>
      <p className="text-gray-600">
        <strong>Age:</strong> {dbUserInfo?.age || "Loading..."}
      </p>
      <Button disabled={isPending} onClick={handleLogout} className="mt-4">
        Logout
      </Button>
    </div>
  );
};

export default HomeComponent;
