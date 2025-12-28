import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { patientEmail } = await req.json();
    if (!patientEmail) {
      return NextResponse.json(
        { data: null, success: false, message: "Missing patientEmail" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("patient_channeling")
      .select(`*, channel(*)`)
      .eq("patientEmail", patientEmail)
      .eq("state", true)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: error.message,
      });
    }

    return NextResponse.json({
      data,
      success: true,
      message: "History fetched",
    });
  } catch (e) {
    return NextResponse.json(
      {
        data: null,
        success: false,
        message: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
