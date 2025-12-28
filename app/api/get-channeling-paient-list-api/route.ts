import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { channelId } = await request.json();

    if (!channelId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "channelId is required",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("patient_channeling")
      .select(`
        id,
        patientEmail,
        patientNumber,
        patientNote,
        channeledDate,
        channeledTime,
        state,
        channel:channelId (
          id,
          name,
          roomNumber,
          currentNumber
        )
      `)
      .eq("channelId", channelId)
      .order("patientNumber", { ascending: true });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Patient list fetched successfully",
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
