import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const isAlreadyNotEmergencyManager = await supabaseServer
      .from("user")
      .select("*")
      .eq("email", email)
      .eq("role", "user")
      .maybeSingle();
    console.log(isAlreadyNotEmergencyManager);

    if (isAlreadyNotEmergencyManager.data) {
      return NextResponse.json({
        data: null,
        error: "User is already not an emergency manager",
        success: false,
      });
    }

    const removeEmergencyManager = await supabaseServer
      .from("user")
      .update({
        role: "user",
      })
      .eq("email", email)
      .select()
      .maybeSingle();

    if (removeEmergencyManager.data === null) {
      return NextResponse.json({
        data: null,
        error: "No user found with the provided email",
        success: false,
      });
    }
    return NextResponse.json({
      data: removeEmergencyManager.data,
      success: true,
      message: "Emergency manager removed successfully",
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to remove emergency manager" });
  }
}
