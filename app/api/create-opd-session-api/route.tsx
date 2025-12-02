import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    console.log("Request Data:", requestData);
    // API to create an OPD session

    const createSessionData = await supabaseServer
      .from("opdsession")
      .insert({
        doctorEmail: requestData.doctorEmail,
        doctorName: requestData.doctorName,
        timeSlot: requestData.timeSlot,
        numberOfPatientsSlots: requestData.numberOfPatientsSlots,
        estimatedTimePerPatient: requestData.estimatedTimePerPatient,
        notes: requestData.notes || "",
        orginalSlotsCount: requestData.numberOfPatientsSlots,
      })
      .select();
    if (createSessionData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: createSessionData.error.message,
      });
    }
    return NextResponse.json({
      data: createSessionData.data,
      success: true,
      message: "OPD session created successfully",
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
