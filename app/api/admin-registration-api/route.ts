import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// Create POST API to register a user as admin by email
export async function POST(req: NextRequest) {
  // Get the email from the request body
  try {
    console.log("Reached here");
    console.log(req);
    const { email } = await req.json();
    console.log(email);
    // Update the user's role to "admin" in the "user" table

    const isAlreadyAdmin = await supabaseServer
      .from("user")
      .select("*")
      .eq("email", email)
      .eq("role", "admin")
      .maybeSingle();
    if (isAlreadyAdmin.data) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "User is already an admin",
      });
    }

    const userDetails = await supabaseServer
      .from("user")
      .update({
        role: "admin",
      })
      .eq("email", email)
      .select()
      .maybeSingle();

    const noOfUsers = await supabaseServer
      .from("user")
      .select("*", { count: "exact", head: true });

    const noOfAdmins = await supabaseServer
      .from("user")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    console.log(noOfAdmins, noOfUsers);
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
      message: "User updated to admin successfully",
      noOfUsers: noOfUsers.count,
      noOfAdmins: noOfAdmins.count,
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
