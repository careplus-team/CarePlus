import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { channelId } = await req.json();
    const channelDetailsData = await supabaseServer
      .from("channel")
      .select("*")
      .eq("id", channelId)
      .maybeSingle();
    if (channelDetailsData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: channelDetailsData.error.message,
      });
    }
    return NextResponse.json({
      data: channelDetailsData.data,
      success: true,
      message: "Channel details fetched successfully",
    });
  } catch (error) {
    return NextResponse.json({
      data: null,
      success: false,
      message: "An error occurred while fetching channel details",
    });
  }
}
