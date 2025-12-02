import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    // Get doctorEmail from the request body
    const { doctorEmail } = await request.json();
    // Fetch channel list for the given doctorEmail
    const channelListData = await supabaseServer
      .from("channel")
      .select("*")
      .eq("doctorEmail", doctorEmail)
      .order("created_at", { ascending: false });
    if (channelListData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: channelListData.error.message,
      });
    }
    return NextResponse.json({
      data: channelListData.data,
      success: true,
      message: "Channel list fetched successfully",
    });
  } catch (error) {
    return NextResponse.json({
      data: null,
      success: false,
      message: "An error occurred while fetching the channel list",
    });
  }
}
