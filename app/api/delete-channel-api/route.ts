import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";
import checkChannelExists from "@/lib/helper/check-channel-exists";
export async function POST(req: NextRequest) {
  try {
    const { channelId } = await req.json();
    // Check if channel exists
    const channelExists = await checkChannelExists(channelId);
    if (!channelExists) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "Channel not found",
      });
    }
    const deletedChannelData = await supabaseServer
      .from("channel")
      .delete()
      .eq("id", channelId)
      .select("*")
      .maybeSingle();
    if (deletedChannelData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: deletedChannelData.error.message,
      });
    }
    return NextResponse.json({
      data: deletedChannelData.data,
      success: true,
      message: "Channel deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({
      data: null,
      success: false,
      message: "An error occurred while deleting the channel",
    });
  }
}
