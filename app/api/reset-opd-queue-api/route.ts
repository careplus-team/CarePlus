import { supabaseServer } from "@/lib/supabase/admin";
import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { orginaPatientSlots, doctorEmail } = await req.json();
  try {
    const resetData = await supabaseServer
      .from("opdsession")
      .update({ numberOfPatientsSlots: orginaPatientSlots })
      .eq("doctorEmail", doctorEmail)
      .select("*")
      .maybeSingle();
    if (resetData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: resetData.error.message,
      });
    }
    return NextResponse.json({
      data: resetData.data,
      success: true,
      message: "OPD queue reset successfully",
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
