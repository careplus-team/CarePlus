import { supabaseServer } from "@/lib/supabase/admin";
import { NextResponse, NextRequest } from "next/server";

// Create POST API to get doctor details by email or id
export async function POST(req: NextRequest) {
  try {
    // Get the email or id from the request body
    const { email, id } = await req.json();
    
    let query = supabaseServer.from("doctor").select("*");

    if (id) {
       query = query.eq("id", id);
    } else if (email) {
       query = query.eq("email", email);
    } else {
        return NextResponse.json({
            data: null,
            success: false,
            message: "Email or ID is required",
        }, { status: 400 });
    }

    const doctorData = await query.single();

    // console.log(doctorData);
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
