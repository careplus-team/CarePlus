import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// Create POST API to register a user as ambulance operator by email
export async function POST(req: NextRequest) {
  // Get the email from the request body
  try {
    const { email } = await req.json();

    // Update the user's role to "ambulance_operator" in the "user" table

    const isAlreadyAmbulanceOperator = await supabaseServer
      .from("user")
      .select("*")
      .eq("email", email)
      .eq("role", "ambulance_operator")
      .maybeSingle();
    if (isAlreadyAmbulanceOperator.data) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "User is already an ambulance operator",
      });
    }

    const userDetails = await supabaseServer
      .from("user")
      .update({
        role: "ambulance_operator",
      })
      .eq("email", email)
      .select()
      .maybeSingle();

    // Check for errors
    if (userDetails.data === null) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "No user found with the provided email",
      });
    }
    // create success response
    return NextResponse.json({
      data: userDetails.data,
      success: true,
      message: "User updated to ambulance operator successfully",
    });
  } catch (e) {
    // Handle JSON parsing errors or other unexpected errors

    return NextResponse.json({
      data: null,
      success: false,
      message: "An unexpected error occurred",
    });
  }
}
