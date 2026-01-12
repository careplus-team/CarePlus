import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "../../globals.css";

import { Toaster } from "sonner";

import AdminSecurity from "@/lib/security-walls/admin-security";
import AdminNavbar from "@/lib/UI-helpers/navbars/admin-navbar";

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
    <AdminSecurity>
      <div className="flex flex-col min-h-screen">
        {/* Admin Navbar */}
        <div className="sticky top-0 z-50">
          <AdminNavbar />
        </div>
        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>

      <Toaster position="top-center" />
    </AdminSecurity>
  );
}
