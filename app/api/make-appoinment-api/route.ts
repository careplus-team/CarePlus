import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { channelId, userEmail, note } = await req.json();

    // Fetch current channel data
    const currentChannelData = await supabaseServer
      .from("channel")
      .select("*")
      .eq("id", channelId)
      .maybeSingle();

    // Check for remaining slots

    if (currentChannelData.data.remainingSlots === 0) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "No remaining slots available",
      });
    }

    //Check If previously booked by same user , same channel
    const existingAppointment = await supabaseServer
      .from("appointments")
      .select("*")
      .eq("channelId", channelId)
      .eq("userEmail", userEmail)
      .single();
    console.log("existingAppointment", existingAppointment);
    if (existingAppointment.data) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "You have already booked an appointment for this channel",
      });
    }
    // Create appointment and update channel details atomically
    const createdAppoinments = await supabaseServer
      .from("appointments")
      .insert({
        channelId,
        userEmail,
        seatNumber: currentChannelData.data?.currentNumber,
        note: note,
      })
      .select("*")
      .maybeSingle();

    const updatedChannelDetails = await supabaseServer
      .from("channel")
      .update({
        currentNumber: currentChannelData.data?.currentNumber + 1,
        remainingSlots: currentChannelData.data?.remainingSlots - 1,
      })
      .eq("id", channelId);

    if (createdAppoinments.error) {
      return NextResponse.json({
        data: null,
        error: createdAppoinments.error.message,
        success: false,
        message: "Failed to create appointment",
      });
    }
    return NextResponse.json({
      data: createdAppoinments.data,
      updateChannelData: updatedChannelDetails,
      success: true,
      message: "Appointment created successfully",
    });
  } catch (e) {
    return NextResponse.json({
      data: null,
      success: false,
      message: "An error occurred while creating the appointment",
    });
  }
}
