import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const adminData = await supabaseServer
      .from("user")
      .select("*")
      .eq("email", email)
      .eq("role", "ambulance_operator")
      .maybeSingle();
    console.log(adminData);
    if (!adminData.data) {
      return NextResponse.json({
        isAdmin: false,
        message: "User is not an ambulance operator",
        data: null,
      });
    }

    return NextResponse.json({
      isAdmin: true,
      message: "User is an ambulance operator",
      data: adminData.data,
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { isAdmin: false, message: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
