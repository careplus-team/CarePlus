import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      email,
      gender,
      medicalregno,
      mobileNumber,
      address,
      dateOfBirth,
      specialization,
      currentWorkplace,
      bio,
      profilePicture,
    } = await req.json();

    const { data: existingDoctor, error: fetchError } = await supabaseServer
      .from("doctor")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    console.log("doctor data", existingDoctor);
    if (fetchError) {
      return NextResponse.json({
        data: null,
        success: false,
        message: fetchError.message,
      });
    }
    if (existingDoctor) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "Doctor with this email already exists",
      });
    }
    const { data: newDoctor, error: insertError } = await supabaseServer
      .from("doctor")
      .insert([
        {
          email,
          name,
          specialization,
          gender: gender?.toLowerCase(),
          medicalregno,
          phoneNumber: mobileNumber,
          address,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          workplace: currentWorkplace,
          bio,
          profilePicture: profilePicture || "/doctor-default.jpg",
          verification: false,
          OPD: false,
        },
      ])
      .select("*")
      .maybeSingle();
    console.log("new doctor data", newDoctor);
    console.log("insert error", insertError);
    if (insertError) {
      console.log("Error inserting doctor:", insertError);
      return NextResponse.json({
        data: null,
        success: false,
        message: insertError.message,
      });
    }
    return NextResponse.json({
      data: newDoctor,
      success: true,
      message: "Doctor registered successfully",
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { data: null, success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
