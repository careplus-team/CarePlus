import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { reportId } = await req.json();

    const insertData = await supabaseServer
      .from("lab_report")
      .delete()
      .eq("id", reportId)
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
