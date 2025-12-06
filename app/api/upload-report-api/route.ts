import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { patientEmail, title, reportUrl, description, patientName } =
      await req.json();

    const insertData = await supabaseServer
      .from("lab_report")
      .insert({
        patientEmail,
        title,
        reportUrl,
        description,
        patientName,
      })
      .select("*")
      .maybeSingle();
    if (insertData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: insertData.error.message,
      });
    }
    return NextResponse.json({
      data: insertData.data,
      success: true,
      message: "Lab report uploaded successfully",
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
