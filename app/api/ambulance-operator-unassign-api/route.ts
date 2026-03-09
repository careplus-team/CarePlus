import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// POST: Remove an operator assignment from an ambulance
export async function POST(req: NextRequest) {
  try {
    const { ambulanceId } = await req.json();

    if (!ambulanceId) {
      return NextResponse.json(
        { success: false, message: "ambulanceId is required" },
        { status: 400 },
      );
    }

    const { error } = await supabaseServer
      .from("ambulance_operator")
      .delete()
      .eq("ambulanceId", ambulanceId);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Operator removed from ambulance successfully",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
