import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const { data: bookedPatients, error } = await supabaseServer
      .from("opd_booking")
      .select("*")
      .eq("patientEmail", email);

    if (error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: error.message,
      });
    }
    if (bookedPatients.length > 0) {
      return NextResponse.json({
        data: bookedPatients,
        success: true,
        message: "Booked patients found",
      });
    } else {
      return NextResponse.json({
        data: [],
        success: true,
        message: "No booked patients found",
      });
    }
  } catch (e) {
    return NextResponse.json(
      {
        message: "Internal server error",
        data: e instanceof Error ? e.message : "Unknown error",
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
