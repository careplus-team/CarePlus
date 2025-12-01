"use client";
import { createClient } from "@/lib/supabase/client";
import { Lock, UserLock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";

const ResetPasswordComponent = () => {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [resetError, setResetError] = useState<any>(null);
  const [buttonText, setButtonText] = useState("Reset Password");
  const [errorMessage, setErrorMessage] = useState<any | null>(null);
  useEffect(() => {
    if (resetError === "error") {
      toast.error("Error Sending Password Reset Email ", {
        description: errorMessage?.message,
      });
    } else if (resetError === "no error") {
      toast.success("Password reset email sent", {
        description: "Check your inbox for the reset link.",
        action: {
          label: "Open Email",
          onClick: () => window.open("https://mail.google.com", "_blank"),
        },
      });
    }
  }, [resetError]);

  const handleResetButton = () => {
    startTransition(async () => {
      setButtonText("Sending...");
      const client = createClient();
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/change-password`,
      });
      console.log("Password reset email sent", error);
      setErrorMessage(error);

      if (error) {
        setResetError("error");
      } else {
        setResetError("no error");
      }
      setButtonText("Resend Email");
    });
    console.log("Password reset email sent", resetError);
    setResetError(null);
  };
  console.log("hi", errorMessage);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12  rounded-2xl bg-white shadow-2xl p-8 space-y-8">
      <div className=" absolute top-4 left-4 ">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500  to-green-500 font-bold  text-2xl">
          <a href="/">CarePlus</a>
        </p>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl  bg-white p-10 rounded-xl gap-16">
        <div className="hidden md:flex flex-1 items-center justify-center  ">
          <Image
            src="/reset.svg"
            alt="Reset Password Illustration"
            className="w-96 max-w-xs md:max-w-sm lg:max-w-md object-contain drop-shadow-lg"
            width={350}
            height={350}
            priority
          />
        </div>
        <div className=" p-5">
          <div className="flex flex-col items-center space-y-2">
            <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 p-4 shadow">
              <UserLock className="h-10 w-10 text-indigo-600" />
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 text-center">
              Reset Password
            </h1>
            <p className="text-base text-gray-500 text-center">
              Enter your email address to receive a password reset link.
            </p>
          </div>
          <div className="space-y-6 mt-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                disabled={isPending}
                className="w-full bg-white rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-base"
                autoComplete="email"
              />
            </div>
            <button
              onClick={handleResetButton}
              disabled={isPending || !email}
              className="w-full flex justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold py-3 transition hover:from-indigo-600 hover:to-blue-600 disabled:bg-indigo-300 disabled:cursor-not-allowed shadow-lg"
            >
              {isPending && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              )}
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordComponent;
