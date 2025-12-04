import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { doctorEmail } = await req.json();
  try {
    const state = await supabaseServer
      .from("opdsession")
      .update({
        started: true,
        numberOfPatientsSlots: 0,
        lastIssuedToken: 0,
      })
      .eq("doctorEmail", doctorEmail)
      .select("*")
      .maybeSingle();

    if (state.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: state.error.message,
      });
    }
    return NextResponse.json({
      data: state.data,
      success: true,
      message: "OPD session started successfully",
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
