import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Ambulance ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from("ambulance")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({
      success: true,
      message: "Ambulance deleted successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
