import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const doctorOpdSessionData = await supabaseServer
      .from("opdsession")
      .select("*")
      .eq("doctorEmail", email)
      .order("created_at", { ascending: false });
    if (doctorOpdSessionData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: doctorOpdSessionData.error.message,
      });
    }
    return NextResponse.json({
      data: doctorOpdSessionData.data,
      success: true,
      message: "Doctor OPD session list fetched successfully",
    });
  } catch (error) {
    return NextResponse.json({
      data: null,
      success: false,
      message: "An error occurred while fetching the doctor's OPD session list",
    });
  }
}
