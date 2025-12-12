import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { channelId } = await req.json();
    // Fetch visited slots for the given channelId
    const visitedSlotsData = await supabaseServer
      .from("channel")
      .select("visitedNumbers")
      .eq("id", channelId);
    if (visitedSlotsData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: visitedSlotsData.error.message,
      });
    }
    // Check if data exists
    if (!visitedSlotsData.data || visitedSlotsData.data.length === 0) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "No channel found",
      });
    }
    // Return the visited slots (If no anyone visited, it will return as visitedNumbers: null)
    return NextResponse.json({
      data: visitedSlotsData.data,
      success: true,
      message: "Visited slots fetched successfully",
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
