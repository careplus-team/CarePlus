import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

//get channeled patient data by channel number

export async function POST(req: NextRequest) {
  const { patientNumber, channelId } = await req.json();
  try {
    const patientData = await supabaseServer
      .from("patient_channeling")
      .select("*")
      .eq("channelId", channelId)
      .eq("patientNumber", patientNumber)
      .maybeSingle();

    if (patientData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: patientData.error.message,
      });
    }
    if (!patientData.data) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "No patient found with the given details",
      });
    }
    return NextResponse.json({
      data: patientData.data,
      success: true,
      message: "Patient data fetched successfully",
    });
  } catch (e) {
    return NextResponse.json(
      {
        data: null,
        success: false,
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
