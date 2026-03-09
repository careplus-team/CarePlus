import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// Create POST API to register a user as ambulance operator by email
export async function POST(req: NextRequest) {
  // Get the email from the request body
  try {
    const { email, ambulanceId } = await req.json();

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

    // Optional: assign to an ambulance if ambulanceId was provided
    if (ambulanceId) {
      // Remove any existing assignment for this operator
      await supabaseServer
        .from("ambulance_operator")
        .delete()
        .eq("userEmail", email);

      // Remove any existing assignment for the target ambulance
      await supabaseServer
        .from("ambulance_operator")
        .delete()
        .eq("ambulanceId", ambulanceId);

      // Create the new assignment
      const { error: assignError } = await supabaseServer
        .from("ambulance_operator")
        .insert({ userEmail: email, ambulanceId });

      if (assignError) {
        // Role was promoted but assignment failed — still return success with a warning
        return NextResponse.json({
          data: userDetails.data,
          success: true,
          message:
            "User promoted to ambulance operator but ambulance assignment failed: " +
            assignError.message,
        });
      }
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
