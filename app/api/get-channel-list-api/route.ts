import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const channelListData = await supabaseServer
      .from("channel")
      .select("*")
      .neq("state", "ended")

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
