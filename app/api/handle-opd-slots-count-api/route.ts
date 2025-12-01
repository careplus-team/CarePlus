import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

// API to handle decrementing the slots count for OPD sessions
export async function POST() {
  try {
    // Fetch the current number of patient slots (Assume that always there is only one session recode within opdsession table)
    const currentSlotsData = await supabaseServer
      .from("opdsession")
      .select("numberOfPatientsSlots, id")
      .maybeSingle();

    console.log("Current slots data:", currentSlotsData);

    if (currentSlotsData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: currentSlotsData.error.message,
      });
    }

    // Check if there are available slots to decrement
    if ((currentSlotsData.data?.numberOfPatientsSlots || 0) <= 0) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "No slots available",
      });
    }
    // Decrement the number of patient slots by 1
    const updatedSlotsData = await supabaseServer
      .from("opdsession")
      .update({
        numberOfPatientsSlots:
          (currentSlotsData.data?.numberOfPatientsSlots || 0) - 1,
      })
      .eq("id", currentSlotsData.data?.id)
      .select("numberOfPatientsSlots")
      .maybeSingle();
    console.log("Updated slots data:", updatedSlotsData);

    if (updatedSlotsData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: updatedSlotsData.error.message,
      });
    }
    // Return the updated slots count
    return NextResponse.json({
      data: updatedSlotsData.data,
      success: true,
      message: "Slots count updated successfully",
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Internal server error", data: null, success: false },
      { status: 500 }
    );
  }
}
