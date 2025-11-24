import { supabaseServer } from "@/lib/supabase/admin";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    console.log("Request Data:", requestData);

    //API to fetch list of doctors who offer OPD services
    //Request Body Must contain { "command": "OPD" } to trigger this condition

    if (requestData.command && requestData.command === "OPD") {
      const doctorList = await supabaseServer
        .from("doctor")
        .select("*")
        .eq("OPD", true)
        .eq("verification", true);
      console.log(doctorList);

      if (doctorList.error) {
        return NextResponse.json({
          data: null,
          success: false,
          message: doctorList.error.message,
        });
      }
      return NextResponse.json({
        data: doctorList.data,
        success: true,
        message: "Doctor list fetched successfully",
      });
    }

    // Create API to fetch the list of doctors

    const doctorList = await supabaseServer
      .from("doctor")
      .select("*")
      .eq("verification", true);
    console.log(doctorList);
    if (doctorList.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: doctorList.error.message,
      });
    }
    return NextResponse.json({
      data: doctorList.data,
      success: true,
      message: "Doctor list fetched successfully",
    });
  } catch (e) {
    return NextResponse.json(
      {
        message: "Internal server error",
        data: e instanceof Error ? e.message : "Unknown error",
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
