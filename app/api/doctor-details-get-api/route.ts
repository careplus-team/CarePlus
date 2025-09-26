import { supabaseServer } from "@/lib/supabase/admin";
import { NextResponse, NextRequest } from "next/server";

// Create POST API to get doctor details by email
export async function POST(req: NextRequest) {
  try {
    // Get the email from the request body
    const { email } = await req.json();
    // Fetch the doctor details from the "doctor" table using the provided email
    const doctorData = await supabaseServer
      .from("doctor")
      .select("*")
      .eq("email", email)
      .single();

    console.log(doctorData);
    // Check for errors
    if (doctorData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: doctorData.error.message,
        code: doctorData.error.code,
      });
    }
    // Return the fetched doctor details
    return NextResponse.json({
      data: doctorData.data,
      success: true,
      message: "Doctor details fetched successfully",
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
