import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { reportId } = await req.json();
    const deleteData = await supabaseServer
      .from("lab_report")
      .delete()
      .eq("id", reportId)
      .select("*")
      .maybeSingle();
    if (deleteData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: deleteData.error.message,
      });
    }
    return NextResponse.json({
      data: deleteData.data,
      success: true,
      message: "Lab report deleted successfully",
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
