import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";
import checkChannelExists from "@/lib/helper/check-channel-exists";
import checkUserExists from "@/lib/helper/check-user-exists";

export async function POST(req: NextRequest) {
  try {
    const { channelId, userEmail } = await req.json();

    // Check if channel exists
    const channelExists = await checkChannelExists(channelId);
    if (!channelExists) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "Channel not found",
      });
    }

    // Check if user exists
    const userExists = await checkUserExists(userEmail);
    if (!userExists) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "User not found",
      });
    }
    const appointmentDetails = await supabaseServer
      .from("appointments")
      .select("*")
      .eq("channelId", channelId)
      .eq("userEmail", userEmail)
      .maybeSingle();

    if (appointmentDetails.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: appointmentDetails.error.message,
      });
    }
    return NextResponse.json({
      data: appointmentDetails.data,
      success: true,
      message: "Appointment details fetched successfully",
    });
  } catch (error) {
    return NextResponse.json({
      data: null,
      success: false,
      message: "An error occurred while fetching appointment details",
    });
  }
}
