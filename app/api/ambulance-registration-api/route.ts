import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      license_plate,
      make,
      model,
      patient_capacity,
      medical_equipment,
      image_url,
    } = body;

    const { data, error } = await supabaseServer
      .from("ambulance")
      .insert({
        license_plate,
        make,
        model,
        patient_capacity,
        medical_equipment,
        image_url,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({
      success: true,
      message: "Ambulance registered successfully",
      data,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
