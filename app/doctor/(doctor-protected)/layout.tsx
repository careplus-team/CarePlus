import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "../../globals.css";

import { Toaster } from "sonner";
import DoctorSecurity from "@/lib/security-walls/doctor-security";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Care Plus . Care At Your Finger Tips",
  description: "Your health, our priority.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DoctorSecurity>
      {children}
      <Toaster position="top-center" />
    </DoctorSecurity>
  );
}
