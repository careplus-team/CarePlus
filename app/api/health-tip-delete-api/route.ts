import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  try {
    const deleteHealthTip = await supabaseServer
      .from("healthtip")
      .delete()
      .eq("id", id);
    console.log(deleteHealthTip);
    if (deleteHealthTip.error) {
      return NextResponse.json({
        message: "Error Occured While Deleting Health Tip",
        success: false,
        data: null,
      });
    }
    return NextResponse.json({
      message: "Health Tip Successfully Deleted",
      data: deleteHealthTip.data,
      success: true,
    });
  } catch (e) {
    return NextResponse.json({
      message: "Error Occured While Deleting Health Tip",
      success: false,
      data: null,
    });
  }
}
