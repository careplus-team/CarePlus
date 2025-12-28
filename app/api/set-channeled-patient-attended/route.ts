import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { channelId, patientEmail } = await req.json();
    const updateData = await supabaseServer
      .from("patient_channeling")
      .update({
        state: true,
      })
      .eq("id", channelId)
      .eq("patientEmail", patientEmail)
      .select("*")
      .maybeSingle();
    if (updateData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: updateData.error.message,
      });
    }
    if (!updateData.data) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "No matching patient channeling record found",
      });
    }
    return NextResponse.json({
      data: updateData.data,
      success: true,
      message: "Patient attended status updated successfully",
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
