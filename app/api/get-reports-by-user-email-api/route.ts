import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const userData = await supabaseServer
      .from("lab_report")
      .select("*")
      .eq("patientEmail", email)
      .maybeSingle();
    console.log(userData);
    if (userData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: userData.error.message,
      });
    }
    if (!userData.data) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "Report not found",
      });
    }
    return NextResponse.json({
      data: userData.data,
      success: true,
      message: "Report fetchedsuccessfully",
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
