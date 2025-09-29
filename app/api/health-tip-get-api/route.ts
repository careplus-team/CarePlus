import { supabaseServer } from "@/lib/supabase/admin";
import { NextResponse, NextRequest } from "next/server";

// Create GET API to get health tips
export async function GET() {
  try {
    // Fetch the health tips from the "healthtip" table
    const healthTipData = await supabaseServer.from("healthtip").select("*");

    console.log(healthTipData);
    // Check for errors
    if (healthTipData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: healthTipData.error.message,
        code: healthTipData.error.code,
      });
    }
    // Return the fetched health tip details
    return NextResponse.json({
      data: healthTipData.data,
      success: true,
      message: "Health tip details fetched successfully",
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
