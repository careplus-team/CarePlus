import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { channelId } = await request.json();

    if (!channelId) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "channelId is required",
      });
    }

    const PatientListData = await supabaseServer
      .from("patient_channel")
      .select("*")
      .neq("state", "ended")
      .eq("id", channelId);

    if (PatientListData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: PatientListData.error.message,
      });
    }
    return NextResponse.json({
      data: PatientListData.data,
      success: true,
      message: "Patient list fetched successfully",
    });
  } catch (error) {
    return NextResponse.json({
      data: null,
      success: false,
      message: "An error occurred while fetching the channel list",
    });
  }
}
