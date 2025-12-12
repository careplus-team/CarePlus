import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { patientEmail } = await req.json();
    const channelingsData = await supabaseServer
      .from("patient_channeling")
      .select("*")
      .eq("patientEmail", patientEmail)
      .eq("state", false)
      .order("created_at", { ascending: true });
    if (channelingsData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: channelingsData.error.message,
      });
    }
    return NextResponse.json({
      data: channelingsData.data,
      success: true,
      message: "Upcoming channelings fetched successfully",
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
