import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  try {
    const deleteNotice = await supabaseServer
      .from("notice")
      .delete()
      .eq("id", id);
    console.log(deleteNotice);
    if (deleteNotice.error) {
      return NextResponse.json({
        message: "Error Occured While Deleting Notice",
        success: false,
        data: null,
      });
    }
    return NextResponse.json({
      message: "Notice Successfully Deleted",
      data: deleteNotice.data,
      success: true,
    });
  } catch (e) {
    return NextResponse.json({
      message: "Error Occured While Deleting Notice",
      success: false,
      data: null,
    });
  }
}
