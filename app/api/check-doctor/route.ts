import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const doctorData = await supabaseServer
      .from("doctor")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    console.log(doctorData);
    if (!doctorData.data) {
      return NextResponse.json({
        isDoctor: false,
        message: "User is not a doctor",
        data: null,
      });
    }

    return NextResponse.json({
      isDoctor: true,
      message: "User is a doctor",
      data: doctorData.data,
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { isDoctor: false, message: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
