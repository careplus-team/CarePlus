import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

//create POST api for doctor registration
export async function POST(request: NextRequest) {
  try {
    // Get the JSON body from the request
    const body = await request.json();

    //check if the doctor email register as normal user
    const userCheck = await supabaseServer
      .from("user")
      .select("*")
      .eq("email", body.email)
      .maybeSingle();
    if (!userCheck.data) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "Email is not  registered as a user.",
      });
    }
    // Insert the doctor details into the "doctor" table
    const doctorDetails = await supabaseServer
      .from("doctor")
      .insert({
        email: body.email,
        name: body.name,
        specialization: body.specialization,
        medicalregno: body.medicalregno,
        gender: body.gender,
        phoneNumber: body.phoneNumber,
        address: body.address,
        workplace: body.workplace,
        bio: body.bio,
        profilePicture: body.profilePicture || "/doctor-default.jpg",
      })
      .select(); // Use .select() to return the inserted row
    // Check for errors during insertion
    if (doctorDetails.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: doctorDetails.error.message,
      });
    }
    // Return a success response with the inserted doctor details
    return NextResponse.json({
      data: doctorDetails,
      success: true,
      message: "Doctor registered successfully",
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
