import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { channelId, slotNumber, patientEmail, patientNote, doctorEmail } =
      await req.json();

    //fetch existing channel data

    const { data: currentData } = await supabaseServer
      .from("channel")
      .select("remainingSlots, totalSlots , date , time")
      .eq("id", channelId)
      .single();
    if (!currentData) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "Channel not found",
      });
    }
    if (currentData.remainingSlots <= 0) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "No remaining slots available",
      });
    }

    //check if already booked by the patient
    const { data: existingBooking, error: bookingError } = await supabaseServer
      .from("patient_channeling")
      .select("*")
      .eq("channelId", channelId)
      .eq("patientEmail", patientEmail);
    if (bookingError) {
      return NextResponse.json({
        data: null,
        success: false,
        message: bookingError.message,
      });
    }
    if (existingBooking && existingBooking.length > 0) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "Patient have already booked this channel",
      });
    }

    //update remaining slots
    const { data, error } = await supabaseServer
      .from("channel")
      .update({
        remainingSlots: currentData.remainingSlots - 1,
      })
      .eq("id", channelId)
      .select("*")
      .maybeSingle();
    if (error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: error.message,
      });
    }

    //insert into patient_channeling table
    const { data: updatedChannelData, error: updateError } =
      await supabaseServer
        .from("patient_channeling")
        .insert({
          channelId: channelId,
          patientEmail: patientEmail,
          patientNote: patientNote,
          doctorEmail: doctorEmail,
          channeledDate: currentData.date,
          channeledTime: currentData.time,
          state: false,
          patientNumber: slotNumber,
        })

        .select("*")
        .maybeSingle();
    if (updateError) {
      return NextResponse.json({
        data: null,
        success: false,
        message: updateError.message,
      });
    }
    return NextResponse.json({
      data: { channelData: data, patientChannelingData: updatedChannelData },
      success: true,
      message: "Channel booking successful",
    });
  } catch (e) {
    return NextResponse.json(
      {
        message: "Internal server error",
        data: e instanceof Error ? e.message : "Unknown error",
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
