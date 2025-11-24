import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();
    const sessionData = await supabaseServer
      .from("opdsession")
      .select("numberOfPatientsSlots, id")
      .maybeSingle();

    if (sessionData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: sessionData.error.message,
      });
    }
    if (!sessionData.data) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "No OPD session found",
      });
    }
    if (action === "decrement") {
      if ((sessionData.data?.numberOfPatientsSlots || 0) <= 0) {
        return NextResponse.json({
          data: null,
          success: false,
          message: "No patients available",
        });
      }
      const updatedSlotsData = await supabaseServer
        .from("opdsession")
        .update({
          numberOfPatientsSlots: sessionData.data?.numberOfPatientsSlots - 1,
        })
        .eq("id", sessionData.data?.id)
        .select("numberOfPatientsSlots , id")
        .maybeSingle();

      if (updatedSlotsData.error) {
        return NextResponse.json({
          data: null,
          success: false,
          message: updatedSlotsData.error.message,
        });
      }
      return NextResponse.json({
        data: updatedSlotsData.data,
        success: true,
        message: "Patients count decremented successfully",
      });
    }

    if (action === "increment") {
      const updatedSlotsData = await supabaseServer
        .from("opdsession")
        .update({
          numberOfPatientsSlots: sessionData.data?.numberOfPatientsSlots + 1,
        })
        .eq("id", sessionData.data?.id)
        .select("numberOfPatientsSlots , id")
        .maybeSingle();
      if (updatedSlotsData.error) {
        return NextResponse.json({
          data: null,
          success: false,
          message: updatedSlotsData.error.message,
        });
      }
      return NextResponse.json({
        data: updatedSlotsData.data,
        success: true,
        message: "Patients count incremented successfully",
      });
    }
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Internal server error", data: null, success: false },
      { status: 500 }
    );
  }
}
