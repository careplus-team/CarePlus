import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { channelId, patientEmail } = await req.json();
    console.log("Received channelId and patientEmail:", {
      channelId,
      patientEmail,
    });
    const channelingInfo = await supabaseServer
      .from("patient_channeling")
      .select("*")
      .eq("channelId", channelId)
      .eq("patientEmail", patientEmail)
      .maybeSingle();
    console.log("channelingInfo", channelingInfo);
    if (channelingInfo.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: channelingInfo.error.message,
      });
    }
    if (!channelingInfo.data) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "No channeling info found for the patient",
      });
    }
    return NextResponse.json({
      data: channelingInfo.data,
      success: true,
      message: "Channeling info fetched successfully",
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
