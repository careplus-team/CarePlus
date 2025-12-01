import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { userEmail } = await req.json();
    const getAppoinmentList = await supabaseServer
      .from("appointments")
      .select("*")
      .eq("userEmail", userEmail);
    if (getAppoinmentList.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: `Failed to fetch appointment list . Error: ${getAppoinmentList.error.message}`,
      });
    }
    return NextResponse.json({
      data: getAppoinmentList.data,
      success: true,
      message: "Appointment list fetched successfully",
    });
  } catch (error) {
    return NextResponse.json({
      data: null,
      success: false,
      message: `An error occurred while fetching appointment list . Error: ${error}`,
    });
  }
}
