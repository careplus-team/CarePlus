"use client";
import Image from "next/image";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  Phone,
  MessageSquare,
  Zap,
  CheckCircle,
} from "lucide-react"; // Modern Icons for better context

// --- Component Imports (assuming these are defined elsewhere in your project) ---
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// --- Zod Schema for Booking Form ---
const BookingSchema = z.object({
  patientName: z.string().min(2, {
    message: "Patient name must be at least 2 characters.",
  }),
  additionalPhoneNumber: z
    .string()
    .regex(
      /^(?:0\d{9}|\+94\d{9})$/,
      "Please enter a valid Sri Lankan phone number (e.g., 0712345678 or +94712345678)."
    )
    .optional(),
  patientNote: z.string().optional(),
});

type BookingFormValues = z.infer<typeof BookingSchema>;

// --- Mock Data Structure ---
interface ChannelDetails {
  channelName: string;
  description: string;
  doctorName: string;
  doctorEmail: string;
  date: string;
  time: string;
  totalSlots: number;
  roomNumber: number;
  price: string;
}

// --- Mock Channel Data ---
const mockChannelDetails: ChannelDetails = {
  channelName: "General Consultation",
  description: "Brief discussion on non-emergency health issues and check-ups. Dedicated time for routine checks and chronic condition management.",
  doctorName: "Dr. John Doe",
  doctorEmail: "doctor@careplus.com",
  date: "Friday, Dec 20, 2025", 
  time: "10:00 AM - 11:00 AM", 
  totalSlots: 10,
  roomNumber: 101,
  
  price: "LKR 2500.00",
};

// --- Mock Submission Function ---
const submitChannelBooking = async (
  formData: BookingFormValues,
  channelId: number
) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("Channel Booking Data:", {
        ...formData,
        channelId,
        bookingTime: new Date().toISOString(),
      });
      // Simulate failure 10% of the time for testing error toasts
      if (Math.random() < 0.1) {
          reject(new Error("Database connection failed."));
      } else {
          resolve({ success: true, message: "Booking successful!" });
      }
    }, 1500);
  });
};

// --- Main Component ---
const BookingChannelComponent = () => {
  const availableSlots: number = 5;
  const channelId = 123;

  const [isPending, startTransition] = useTransition();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(BookingSchema),
    defaultValues: {
      patientName: "",
      additionalPhoneNumber: "",
      patientNote: "",
    },
  });

  const submitHandler = (data: BookingFormValues) => {
    startTransition(async () => {
      try {
        await submitChannelBooking(data, channelId);
        toast.success("✅ Booking Confirmed!", {
          description: "Your appointment has been successfully booked with " + mockChannelDetails.doctorName + ".",
        });
        form.reset();
      } catch (error) {
        console.error("Booking failed:", error);
        toast.error("❌ Booking Failed", {
          description:
            "There was an error processing your request. Please check the details and try again.",
        });
      }
    });
  };

  const channel = mockChannelDetails;

  // Helper component for detail items
  const DetailItem = ({ icon, label, value, highlight = false }: { icon: React.ReactNode, label: string, value: string, highlight?: boolean }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
      <div className="flex items-center">
        {icon}
        <span className="ml-3 text-sm font-medium text-gray-600">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${highlight ? 'text-indigo-600' : 'text-gray-800'}`}>{value}</span>
    </div>
  );

  // --- Doctor/Channel Info Block (Modernized) ---
  const ChannelInfoBlock = () => (
    <div className="md:sticky md:top-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit">
      <div className="flex flex-col items-center pb-6 border-b border-gray-100">
        {/* Doctor Image & Profile */}
        <div className="relative w-32 h-32 mb-4">
          <Image
            src="/doctor-default-avatar.png"
            alt={channel.doctorName}
            width={128}
            height={128}
            className="rounded-full object-cover border-4 border-indigo-400/50 shadow-md transition-transform duration-300 hover:scale-[1.03]"
          />
          <div className="absolute bottom-0 right-0 p-1 bg-green-500 rounded-full border-2 border-white" title="Available">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        </div>
        {/* Doctor & Channel Title */}
        <h2 className="text-2xl font-extrabold text-gray-800 text-center">
          {channel.doctorName}
        </h2>
        <p className="text-xl font-semibold text-indigo-600/90 mt-1 tracking-wide">
          {channel.channelName}
        </p>
        <p className="text-sm text-gray-500 mt-2 italic text-center">
          {channel.description}
        </p>
      </div>

      {/* Appointment Details Grid */}
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">
            Appointment Details
        </h3>
        {/* The design uses a clean grid for key details */}
        <DetailItem icon={<Calendar className="w-5 h-5 text-indigo-500" />} label="Date" value={channel.date} highlight={true} />
        <DetailItem icon={<Clock className="w-5 h-5 text-indigo-500" />} label="Time Slot" value={channel.time} highlight={true} />
        <DetailItem icon={<MessageSquare className="w-5 h-5 text-indigo-500" />} label="Room Number" value={String(channel.roomNumber)} />
      </div>
    </div>
  );


  // --- Booking Form Block (Modernized) ---
  const BookingFormBlock = () => (
    <div className="p-6 md:p-10 bg-white rounded-2xl shadow-2xl border border-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
        Book Your Appointment
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submitHandler)}
          className="space-y-8"
        >
          {/* Patient Name Field (Enhanced Input Styling) */}
          <FormField
            control={form.control}
            name="patientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-2 text-indigo-500" /> Patient Full Name
                </FormLabel>
                <FormControl>
                  <input
                    className="p-4 border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white placeholder:text-gray-400 transition-shadow duration-200"
                    type="text"
                    {...field}
                    placeholder="e.g., Jane D. Smith"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Channel Details (Receipt-like - Integrated into form context) */}
          <div className="border-t border-b border-indigo-200 border-dashed py-6 space-y-4 bg-indigo-50/50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" /> Payment Summary
            </h3>
            {/* Price Detail */}
            <div className="flex justify-between items-center pb-2 border-b border-indigo-100">
              <span className="text-lg text-gray-700">Consultation Fee:</span>
              <span className="font-extrabold text-2xl text-green-600">{channel.price}</span>
            </div>
            {/* Slot Detail */}
            <div className="flex justify-between items-center text-sm pt-2">
              <span className="text-gray-600 font-medium flex items-center">
                <Zap className="w-4 h-4 mr-1 text-red-500" /> Available Slots Today:
              </span>
              <span className="font-bold text-lg text-red-500">{availableSlots}</span>
            </div>
          </div>

          {/* Additional Phone Number Field */}
          <FormField
            control={form.control}
            name="additionalPhoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-700 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-indigo-500" /> Additional Phone Number
                </FormLabel>
                <FormControl>
                  <input
                    className="p-4 border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white placeholder:text-gray-400 transition-shadow duration-200"
                    type="tel"
                    {...field}
                    placeholder="e.g., 071-123-4567 (Optional)"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Patient Note Field (Textarea with enhanced styling) */}
          <FormField
            control={form.control}
            name="patientNote"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-700 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-indigo-500" /> Note for Doctor
                </FormLabel>
                <FormControl>
                  <textarea
                    className="p-4 border border-gray-200 rounded-xl w-full min-h-[120px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white placeholder:text-gray-400 transition-shadow duration-200"
                    {...field}
                    placeholder="Briefly describe your primary concern or any symptoms (Optional but Recommended)..."
                    disabled={isPending}
                  />
                </FormControl>
                <FormDescription className="text-sm text-gray-500 mt-2">
                      This note is encrypted and only visible to the doctor and authorized personnel.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button (Modern, full-width with loading state) */}
          <Button
            type="submit"
            className="w-full py-4 text-xl bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/50 transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isPending || availableSlots === 0}
          >
            {isPending ? (
                <>
                    <Zap className="w-5 h-5 mr-2 animate-pulse" />
                    Booking Appointment...
                </>
            ) : availableSlots === 0 ? (
                "Slots Full - Try Another Day"
            ) : (
                "Confirm & Book Channel"
            )}
          </Button>

            {/* General Disclaimer/Security Note */}
            <p className="text-center text-xs text-gray-400 mt-4">
                By booking, you agree to our Terms of Service and Privacy Policy.
            </p>
        </form>
      </Form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Title Block */}
        <div className="text-center md:text-left mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                Channel Appointment
            </h1>
            <p className="text-xl text-gray-500 mt-2">
                Complete the details to book your consultation with {channel.doctorName}.
            </p>
        </div>

        {/* Responsive Layout: Split-Screen on Desktop, Stacked on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left Column (Channel Details - Fixed Position on Desktop) */}
          <div className="md:col-span-1">
            <ChannelInfoBlock />
          </div>

          {/* Right Column (Booking Form - Takes up more space) */}
          <div className="md:col-span-2">
            <BookingFormBlock />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingChannelComponent;