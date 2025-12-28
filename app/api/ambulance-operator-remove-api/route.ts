import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const isAlreadyNotAmbulanceOperator = await supabaseServer
      .from("user")
      .select("*")
      .eq("email", email)
      .neq("role", "ambulance_operator")
      .maybeSingle();
    console.log(isAlreadyNotAmbulanceOperator);

    if (isAlreadyNotAmbulanceOperator.data) {
      return NextResponse.json({
        data: null,
        error: "User is already not an ambulance operator",
        success: false,
      });
    }

    const removeAmbulanceOperator = await supabaseServer
      .from("user")
      .update({
        role: "user",
      })
      .eq("email", email)
      .select()
      .maybeSingle();

    if (removeAmbulanceOperator.data === null) {
      return NextResponse.json({
        data: null,
        error: "No user found with the provided email",
        success: false,
      });
    }
    return NextResponse.json({
      data: removeAmbulanceOperator.data,
      success: true,
      message: "Ambulance operator removed successfully",
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to remove ambulance operator" });
  }
}
