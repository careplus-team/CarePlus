import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { channelId } = await req.json();
    const { data, error } = await supabaseServer
      .from("channel")
      .update({
        state: "ended",
      })
      .eq("id", channelId)
      .select("*")
      .maybeSingle();
    if (error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: error.message,
      });
    }
    return NextResponse.json({
      data: data,
      success: true,
      message: "Channel ended successfully",
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
