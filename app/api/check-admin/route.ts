import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const adminData = await supabaseServer
      .from("user")
      .select("*")
      .eq("email", email)
      .eq("role", "admin")
      .maybeSingle();
    console.log(adminData);
    if (!adminData.data) {
      return NextResponse.json({
        isAdmin: false,
        message: "User is not an admin",
        data: null,
      });
    }

    return NextResponse.json({
      isAdmin: true,
      message: "User is an admin",
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
