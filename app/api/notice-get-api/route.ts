import { supabaseServer } from "@/lib/supabase/admin";
import { NextResponse, NextRequest } from "next/server";

// Create GET API to get notices
export async function GET() {
  try {
    // Fetch the notices from the "notice" table (newest first)
    const noticeData = await supabaseServer
      .from("notice")
      .select("*")
      .order("createdAt", { ascending: false });

    console.log(noticeData);
    // Check for errors
    if (noticeData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: noticeData.error.message,
        code: noticeData.error.code,
      });
    }
    // Return the fetched notice details
    return NextResponse.json({
      data: noticeData.data,
      success: true,
      message: "Notice details fetched successfully",
    });
  } catch (e) {
    // Handle JSON parsing errors or other unexpected errors
    return NextResponse.json(
      {
        message: "Invalid JSON body",
        data: e instanceof Error ? e.message : "Unknown error",
        success: false,
      },
      {
        status: 400,
      }
    );
  }
}
