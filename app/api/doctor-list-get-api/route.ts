import { supabaseServer } from "@/lib/supabase/admin";
import { NextResponse, NextRequest } from "next/server";

// Create GET API to fetch the list of doctors

export async function POST(req: NextRequest) {
  try {
    const doctorList = await supabaseServer.from("doctor").select("*");
    console.log(doctorList);
    if (doctorList.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: doctorList.error.message,
      });
    }
    return NextResponse.json({
      data: doctorList.data,
      success: true,
      message: "Doctor list fetched successfully",
    });
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
