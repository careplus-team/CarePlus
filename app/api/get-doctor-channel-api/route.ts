import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const doctorChannelData = await supabaseServer
      .from("channel")
      .select("*")
      .eq("doctorEmail", email)
      .neq("state", "ended")
      .order("created_at", { ascending: false });
    if (doctorChannelData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: doctorChannelData.error.message,
      });
    }
    return NextResponse.json({
      data: doctorChannelData.data,
      success: true,
      message: "Doctor channel list fetched successfully",
    });
  } catch (error) {
    return NextResponse.json({
      data: null,
      success: false,
      message: "An error occurred while fetching the doctor's channel list",
    });
  }
}
