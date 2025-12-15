"use client";

import Image from "next/image";
import React, { useEffect, useState, useTransition } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { jsPDF } from "jspdf"; // Import jsPDF
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  MessageSquare,
  Zap,
  CheckCircle,
  ClockFading,
  Loader2,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import LoadingUI from "@/lib/UI-helpers/loading-ui";

// --- Types & Interfaces ---
interface ChannelData {
  id: number;
  name: string;
  description: string;
  doctorEmail: string;
  date: string;
  time: string;
  totalSlots: number;
  remainingSlots: number;
  roomNumber: string | number;
  estimateWaitingTime: string;
  price: string;
  state: "started" | "ended" | "pending";
  fee: number;
  additionalFees: number;
}

interface DoctorData {
  name: string;
  profilePicture?: string;
}

interface UserData {
  name: string;
  email: string;
  phone?: string;
}

interface BookingData {
  id: number;
  slotNumber: number;
  patientEmail: string;
  status: string;
  patientNumber: number;
  created_at?: string; // Optional: timestamp of booking
}

// --- Zod Schema ---
const BookingSchema = z.object({
  patientName: z.string().min(2, {
    message: "Patient name must be at least 2 characters.",
  }),
  additionalPhoneNumber: z
    .string()
    .regex(
      /^(?:0\d{9}|\+94\d{9})$/,
      "Please enter a valid Sri Lankan phone number (e.g., 0712345678)."
    )
    .optional()
    .or(z.literal("")),
  patientNote: z.string().optional(),
});

type BookingFormValues = z.infer<typeof BookingSchema>;

// --- Helper Functions ---

const formatWaitingTime = (
  timePerPatient: string | number,
  patientPosition: number
) => {
  const time = Number(timePerPatient);
  if (isNaN(time)) return "N/A";
  const totalMinutes = time * patientPosition;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours} hr ${minutes > 0 ? ` ${minutes} mins` : ""}`;
  return `${totalMinutes} mins`;
};

// --- PDF Generation Logic ---
const generateReceipt = (
  booking: BookingData,
  channelData: ChannelData,
  doctorData: DoctorData | null,
  userData: UserData | null
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // -- Colors --
  const primaryColor = "#4F46E5"; // Indigo
  const grayColor = "#6B7280";
  const blackColor = "#111827";

  // -- Header --
  doc.setFontSize(22);
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("CarePlus", 20, 20);

  doc.setFontSize(10);
  doc.setTextColor(grayColor);
  doc.setFont("helvetica", "normal");
  doc.text("Official E-Receipt", pageWidth - 20, 20, { align: "right" });

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 25, pageWidth - 20, 25); // Horizontal Line

  // -- Appointment Info --
  doc.setFontSize(12);
  doc.setTextColor(grayColor);
  doc.text("Appointment Details", 20, 40);

  doc.setFontSize(16);
  doc.setTextColor(blackColor);
  doc.setFont("helvetica", "bold");
  doc.text(doctorData?.name || "Doctor", 20, 50);

  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.text(channelData.name, 20, 58);

  // -- Grid Details --
  const startY = 70;
  const col1 = 20;
  const col2 = 110;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(blackColor);

  // Row 1
  doc.text("Date:", col1, startY);
  doc.text(channelData.date, col1 + 30, startY);

  doc.text("Time:", col2, startY);
  doc.text(channelData.time, col2 + 30, startY);

  // Row 2
  doc.text("Room No:", col1, startY + 10);
  doc.text(String(channelData.roomNumber), col1 + 30, startY + 10);

  // -- Patient Info Box --
  doc.setFillColor(243, 244, 246); // Light gray bg
  doc.rect(20, startY + 20, pageWidth - 40, 35, "F");

  doc.setFontSize(12);
  doc.setTextColor(blackColor);
  doc.text("Patient Information", 25, startY + 30);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${userData?.name || "N/A"}`, 25, startY + 40);
  doc.text(
    `Email: ${userData?.email || booking.patientEmail}`,
    25,
    startY + 48
  );

  // -- Big Slot Number --
  const estTime = formatWaitingTime(
    channelData.estimateWaitingTime,
    booking.patientNumber
  );

  doc.setFontSize(10);
  doc.setTextColor(grayColor);
  doc.text("Your Slot Number", pageWidth / 2, startY + 70, { align: "center" });

  doc.setFontSize(40);
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(String(booking.patientNumber), pageWidth / 2, startY + 85, {
    align: "center",
  });

  doc.setFontSize(12);
  doc.setTextColor(blackColor);
  doc.text(`Est. Waiting Time: ${estTime}`, pageWidth / 2, startY + 95, {
    align: "center",
  });

  // -- Footer --
  doc.setDrawColor(200, 200, 200);
  doc.line(20, startY + 110, pageWidth - 20, startY + 110);

  doc.setFontSize(8);
  doc.setTextColor(grayColor);
  doc.text("Note: This is a computer-generated receipt.", 20, startY + 120);
  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    pageWidth - 20,
    startY + 120,
    { align: "right" }
  );

  // Save
  doc.save(`CarePlus_Receipt_Slot_${booking.patientNumber}.pdf`);
};

// --- Helper Components ---

const DetailItem = ({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
    <div className="flex items-center">
      {icon}
      <span className="ml-3 text-sm font-medium text-gray-600">{label}</span>
    </div>
    <span
      className={`text-sm font-semibold ${
        highlight ? "text-indigo-600" : "text-gray-800"
      }`}
    >
      {value}
    </span>
  </div>
);

const ChannelInfoBlock = ({
  doctorData,
  channelData,
}: {
  doctorData: DoctorData | null;
  channelData: ChannelData;
}) => (
  <div className="md:sticky md:top-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit">
    <div className="flex flex-col items-center pb-6 border-b border-gray-100">
      <div className="relative w-32 h-32 mb-4">
        <Image
          src={doctorData?.profilePicture || "/default-doctor.png"}
          alt={doctorData?.name || "Doctor"}
          width={128}
          height={128}
          className="rounded-full object-cover border-4 border-indigo-400/50 shadow-md transition-transform duration-300 hover:scale-[1.03]"
        />
        <div
          className="absolute bottom-0 right-0 p-1 bg-green-500 rounded-full border-2 border-white"
          title="Available"
        >
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
      </div>
      <h2 className="text-2xl font-extrabold text-gray-800 text-center">
        {doctorData?.name || "Doctor"}
      </h2>
      <p className="text-xl font-semibold text-indigo-600/90 mt-1 tracking-wide">
        {channelData?.name}
      </p>
      <p className="text-sm text-gray-500 mt-2 italic text-center">
        {channelData?.description}
      </p>
    </div>

    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">
        Appointment Details
      </h3>
      <DetailItem
        icon={<Calendar className="w-5 h-5 text-indigo-500" />}
        label="Date"
        value={channelData?.date || "N/A"}
        highlight={true}
      />
      <DetailItem
        icon={<Clock className="w-5 h-5 text-indigo-500" />}
        label="Time Slot"
        value={channelData?.time || "N/A"}
        highlight={true}
      />
      <DetailItem
        icon={<MessageSquare className="w-5 h-5 text-indigo-500" />}
        label="Room Number"
        value={String(channelData?.roomNumber || "N/A")}
      />
      <DetailItem
        icon={<ClockFading className="w-5 h-5 text-indigo-500" />}
        label="Est. Time / Person"
        value={String(channelData?.estimateWaitingTime || "N/A")}
      />
    </div>
  </div>
);

// --- Booked Status Block ---
const BookedStatusBlock = ({
  booking,
  channelData,
  doctorData,
  userData,
  onCancel,
  isDownloading,
}: {
  booking: BookingData;
  channelData: ChannelData;
  doctorData: DoctorData | null;
  userData: UserData | null;
  onCancel: () => void;
  isDownloading: boolean;
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownload = async () => {
    setIsGeneratingPdf(true);
    try {
      // Small delay to show loading state if PDF generation is instant
      await new Promise((resolve) => setTimeout(resolve, 500));
      generateReceipt(booking, channelData, doctorData, userData);
      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate receipt.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-white rounded-2xl shadow-xl border border-green-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

      <div className="flex flex-col items-center text-center relative z-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          You are Booked!
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Your appointment is confirmed. Please arrive 10 minutes before your
          estimated time.
        </p>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-8 rounded-2xl shadow-lg w-full max-w-sm mb-8 transform transition-transform hover:scale-[1.02]">
          <p className="text-indigo-100 text-sm font-semibold uppercase tracking-widest mb-2">
            Your Slot Number
          </p>
          <div className="text-6xl font-black">{booking.patientNumber}</div>
          <div className="border-2 gap-2 flex flex-col items-center justify-center mt-4 rounded-lg px-4 py-2 bg-indigo-500/20">
            <div className="flex gap-2">Estimate Waiting Time</div>
            {formatWaitingTime(
              channelData.estimateWaitingTime,
              booking.patientNumber
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-indigo-400/30 flex justify-between text-sm text-indigo-100">
            <span>Room: {channelData.roomNumber}</span>
            <span>Date: {channelData.date}</span>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="w-full bg-green-600 border-2 text-white max-w-sm py-6 text-lg rounded-xl mb-3 border-green-700  hover:bg-white hover:text-green-500 hover:border-green-500 "
              onClick={(e) => {
                e.preventDefault(); // Prevent triggering alert dialog for download
                handleDownload();
              }}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Receipt...
                </>
              ) : (
                <>Download E-Receipt</>
              )}
            </Button>
          </AlertDialogTrigger>
          {/* Note: The Download button is wrapped in trigger just for layout, but onClick prevents default behavior. 
           s */}
        </AlertDialog>

        <p className="text-xs text-gray-400 mt-6">
          Need help? Contact support or call the hospital directly.
        </p>
      </div>
    </div>
  );
};

const BookingFormBlock = ({
  channelData,
  userData,
  totalBooked,
  createBooking,
  isBooking,
}: {
  channelData: ChannelData;
  userData: UserData | null;
  totalBooked: number;
  createBooking: (note: string) => void;
  isBooking: boolean;
}) => {
  const total = channelData.totalSlots || 0;
  const percentage = total > 0 ? Math.round((totalBooked / total) * 100) : 0;
  const [patientNote, setPatientNote] = useState("");

  return (
    <div className="p-6 md:p-10 bg-white rounded-2xl shadow-2xl border border-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
        Book Your Appointment
      </h2>

      <div className="bg-white mb-10 rounded-2xl border border-slate-100 shadow-sm p-5 w-full max-w-sm mx-auto md:mx-0">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Current Bookings
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-800">
                {totalBooked}
              </span>
              <span className="text-sm font-medium text-slate-400">
                / {total} Slots
              </span>
            </div>
          </div>
          <div className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg">
            {percentage}% Full
          </div>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
          <div className="flex items-center text-sm">
            <User className="w-4 h-4 mr-2 text-indigo-500" />
            <span className="font-medium text-gray-700">Patient:</span>
            <span className="ml-2 text-gray-900">
              {userData?.name || "N/A"}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Zap className="w-4 h-4 mr-2 text-indigo-500" />
            <span className="font-medium text-gray-700">Booking Slot:</span>
            <span className="ml-2 font-bold text-indigo-600">
              {percentage >= 100 ? "Fully Booked" : ` #${totalBooked + 1}`}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <User className="w-4 h-4 mr-2 text-indigo-500" />
            <span className="font-medium text-gray-700">
              Estimated Waiting Times:
            </span>
            <span className="ml-2  text-blue-500 font-bold">
              {formatWaitingTime(
                channelData.estimateWaitingTime,
                totalBooked + 1
              )}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <DollarSign className="w-4 h-4 mr-2 text-green-500" />
            <span className="font-medium text-gray-700">Fee:</span>
            <span className="ml-2 font-bold text-green-600">
              LKR {channelData.fee + (channelData.additionalFees || 0)}
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Note for Doctor (Optional)
          </label>
          <Textarea
            onChange={(e) => setPatientNote(e.target.value)}
            placeholder="Briefly describe your symptoms..."
            className="min-h-[100px] rounded-xl border-gray-200 focus:ring-indigo-500"
            disabled={isBooking}
          />
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="w-full py-6 text-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.01]"
              disabled={isBooking || percentage >= 100}
            >
              {isBooking ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : percentage >= 100 ? (
                "Fully Booked"
              ) : (
                `Confirm Booking (Slot #${totalBooked + 1})`
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Your Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to book this appointment? This action
                cannot be undone once confirmed. You will be assigned slot #
                {totalBooked + 1} and will need to pay the consultation fee.
                Please ensure all details are correct before proceeding.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => createBooking(patientNote)}>
                Confirm Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        By booking, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

// --- Main Component ---
const BookingChannelComponent = ({ id }: { id: number }) => {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userBooking, setUserBooking] = useState<BookingData | null>(null);

  // 1. Check Auth & Fetch User Data
  useEffect(() => {
    const initData = async () => {
      try {
        const supabaseClient = createClient();
        const { data: authData } = await supabaseClient.auth.getUser();

        if (!authData.user) {
          router.push("/login");
          return;
        }

        const email = authData.user.email;
        if (email) {
          setUserEmail(email);
          const userInfo = await axios.post("/api/get-user-by-email-api", {
            email: email,
          });
          if (userInfo.data.success) {
            setUserData(userInfo.data.data);
          }
        }
      } catch (error) {
        console.error("Auth check failed", error);
        toast.error("Failed to authenticate user");
      }
    };
    initData();
  }, [router]);

  // 2. Fetch Channel & Doctor & Booking Status
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const channelInfo = await axios.post(
          "/api/get-one-channel-deatils-api/",
          { channelId: id }
        );

        if (!channelInfo.data.success) throw new Error("Channel not found");

        const cData: ChannelData = channelInfo.data.data;
        // If session already ended, deny access to everyone
        if (cData.state === "ended") {
          toast.error(
            "This channel session has ended and is no longer accessible"
          );
          router.push("/home");
          return;
        }

        setChannelData(cData);

        const doctorInfo = await axios.post("/api/doctor-details-get-api/", {
          email: cData.doctorEmail,
        });
        if (doctorInfo.data.success) setDoctorData(doctorInfo.data.data);

        // If session has started, only allow users who already have a booking to stay on the page.
        // Fetch the user's booking and redirect to the booking page if none exists.
        if (userEmail) {
          const bookingCheck = await axios.post(
            "/api/get-patient-channeling-info/",
            {
              channelId: id,
              patientEmail: userEmail,
            }
          );

          if (bookingCheck.data.success && bookingCheck.data.data) {
            setUserBooking(bookingCheck.data.data);
          }

          if (
            cData.state === "started" &&
            !(bookingCheck.data.success && bookingCheck.data.data)
          ) {
            toast.error(
              "Only booked users can access this page after the session has started"
            );
            router.push(`/channel-book/${id}`);
            return;
          }
        } else {
          // If the user isn't identified yet and session started, redirect to login
          if (cData.state === "started") {
            router.push("/login");
            return;
          }
        }
      } catch (error) {
        console.error("Data fetch error", error);
        toast.error("Error fetching details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id && userEmail) {
      fetchAllData();
    }
  }, [id, userEmail, router]);

  // 3. Realtime Subscription
  useEffect(() => {
    if (!id || !userEmail) return;

    const supabase = createClient();

    const channelSub = supabase
      .channel(`public:channel:id=eq.${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "channel",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setChannelData(payload.new as ChannelData);
        }
      )
      .subscribe();

    const bookingSub = supabase
      .channel(`public:patient_channeling:user-check`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "patient_channeling",
          filter: `channelId=eq.${id}`,
        },
        (payload) => {
          if (
            payload.eventType === "INSERT" &&
            payload.new.patientEmail === userEmail
          ) {
            setUserBooking(payload.new as BookingData);
            toast.success("Booking confirmed!");
          }
          if (
            payload.eventType === "DELETE" &&
            payload.old.id === userBooking?.id
          ) {
            setUserBooking(null);
            toast.info("Booking cancelled.");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSub);
      supabase.removeChannel(bookingSub);
    };
  }, [id, userEmail, userBooking]);

  const handleBooking = (note: string) => {
    if (!channelData || !userData) return;
    const currentBooked =
      (channelData.totalSlots || 0) - (channelData.remainingSlots || 0);

    startTransition(async () => {
      try {
        const res = await axios.post("/api/channel-booking-api", {
          channelId: channelData.id,
          patientEmail: userData.email,
          patientNote: note,
          doctorEmail: channelData.doctorEmail,
          slotNumber: currentBooked + 1,
        });

        if (!res.data.success) {
          toast.error(res.data.message || "Booking failed");
        }
      } catch (error) {
        console.error("Booking error", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  const handleCancel = () => {
    if (!userBooking) return;
    startTransition(async () => {
      try {
        const res = await axios.post("/api/cancel-booking-api", {
          bookingId: userBooking.id,
          channelId: id,
        });

        if (!res.data.success) {
          toast.error(res.data.message || "Cancellation failed");
        }
      } catch (error) {
        console.error("Cancellation error", error);
        toast.error("Could not cancel booking");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingUI />
      </div>
    );
  }

  if (!channelData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Channel not found.
      </div>
    );
  }

  const totalSlots = channelData.totalSlots || 0;
  const remainingSlots = channelData.remainingSlots || 0;
  const totalBooked = totalSlots - remainingSlots;

  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-50 to-indigo-50 p-4 md:p-12">
      <div className=" absolute top-4 left-4 ">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500  to-green-500 font-bold  text-2xl">
          <a href="/">CarePlus</a>
        </p>
      </div>
      <div className="max-w-7xl mx-auto mt-14 md:mt-5">
        <div className="text-center md:text-left mb-10">
          <h1 className=" md:text-4xl text-2xl font-extrabold text-gray-900 tracking-tight">
            Channel Appointment
          </h1>
          <p className="md:text-xl text-base text-gray-500 mt-2">
            Complete the details to book your consultation with{" "}
            {doctorData?.name}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <ChannelInfoBlock
              doctorData={doctorData}
              channelData={channelData}
            />
          </div>
          <div className="md:col-span-2">
            {userBooking ? (
              <BookedStatusBlock
                booking={userBooking}
                channelData={channelData}
                doctorData={doctorData} // Passed down for Receipt
                userData={userData} // Passed down for Receipt
                onCancel={handleCancel}
                isDownloading={isPending}
              />
            ) : (
              <BookingFormBlock
                channelData={channelData}
                userData={userData}
                totalBooked={totalBooked}
                createBooking={handleBooking}
                isBooking={isPending}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingChannelComponent;
