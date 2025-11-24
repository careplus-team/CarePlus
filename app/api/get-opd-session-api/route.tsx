import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST() {
  try {
    // API to fetch OPD sessions for a specific doctor
    const sessionsResponse = await supabaseServer
      .from("opdsession")
      .select("*");

    if (sessionsResponse.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: sessionsResponse.error.message,
      });
    }
    // Return the fetched OPD sessions
    return NextResponse.json({
      data: sessionsResponse.data,
      success: true,
      message: "OPD sessions fetched successfully",
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
