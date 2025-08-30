"use client";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { describe } from "node:test";
import Image from "next/image";
import { Fingerprint, UserLock } from "lucide-react";

const ChangePasswordComponent = () => {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [result, setResult] = React.useState<any>(null);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  useEffect(() => {
    if (result?.error) {
      toast.error(result.error.message, {});
    } else if (result?.data) {
      toast.success("Password changed successfully!", {
        description: "You can now log in with your new password.",
        action: {
          label: "Go to Home",
          onClick: () => router.push("/home"),
        },
      });
    }
  }, [result]);
  const handleChangePassword = () => {
    if (newPassword && confirmPassword) {
      startTransition(async () => {
        const client = createClient();
        const UpdateResult = await client.auth.updateUser({
          password: newPassword,
        });
        if (!UpdateResult.error) {
          setTimeout(() => {
            router.push("/home");
          }, 300);
        }
        console.log(UpdateResult);
        setResult(UpdateResult);
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen align-middle items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12  rounded-2xl bg-white shadow-2xl p-8 space-y-8">
      <div className=" absolute top-4 left-4 ">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500  to-green-500 font-bold  text-2xl">
          <a href="/">CarePlus</a>
        </p>
      </div>
      <div className="flex bg-white gap-5 justify-center align-middle items-center shadow-xl  rounded-xl">
        <div className="hidden md:flex justify-center items-center p-10 ">
          <Image
            className="w-96 max-w-xs md:max-w-sm lg:max-w-md object-contain drop-shadow-lg"
            src="/change-password.webp"
            height={350}
            width={350}
            alt="Change Password"
          />
        </div>
        <div className=" flex justify-center items-center flex-col p-10 rounded-xl gap-8">
          <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 p-4 shadow">
            <Fingerprint className="h-10 w-10 text-indigo-600" />
          </span>
          <div className="text-2xl font-semibold">Change Password</div>
          <div>
            <div className="flex flex-col ">
              <label className="text-sm text-gray-600 font-semibold">
                New Password
              </label>
              <input
                className="border-2 mt-3 border-gray-300 p-2 rounded-md mb-4 w-64 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col ">
              <label className="text-sm text-gray-600 font-semibold ">
                Confirm New Password
              </label>
              <input
                className="border-2 mt-3 border-gray-300 p-2 rounded-md mb-4 w-64 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="md:mt-5">
              <Button
                className="w-full flex justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold py-3 transition hover:from-indigo-600 hover:to-blue-600 disabled:bg-indigo-300 disabled:cursor-not-allowed shadow-lg"
                disabled={
                  isPending || newPassword !== confirmPassword || !newPassword
                }
                onClick={() => {
                  if (newPassword && confirmPassword) {
                    handleChangePassword();
                  }
                }}
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordComponent;
