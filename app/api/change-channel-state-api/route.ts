import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";
import checkChannelExists from "@/lib/helper/check-channel-exists";
export async function POST(req: NextRequest) {
  try {
    const { channelId, newState } = await req.json();
    // Check if channel exists
    const channelExists = await checkChannelExists(channelId);
    if (!channelExists) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "Channel not found",
      });
    }
    // Update channel state
    const updatedChannelData = await supabaseServer
      .from("channel")
      .update({ state: newState })
      .eq("id", channelId)
      .select("*")
      .maybeSingle();
    if (updatedChannelData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: updatedChannelData.error.message,
      });
    }
    return NextResponse.json({
      data: updatedChannelData.data,
      success: true,
      message: "Channel state updated successfully",
    });
  } catch (error) {
    return NextResponse.json({
      data: null,
      success: false,
      message: "An error occurred while updating the channel state",
    });
  }
}
