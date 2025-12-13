import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { channelId, slotNumber } = await req.json();

    // 1. Fetch the existing array
    const { data: currentData } = await supabaseServer
      .from("channel")
      .select("visitedNumbers, totalSlots")
      .eq("id", channelId)
      .single();

    //check if channel's current data exists
    if (!currentData) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "Channel not found",
      });
    }
    if (slotNumber > currentData.totalSlots) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "Slot number exceeds total slots",
      });
    }
    //check if slotNumber already exists in visitedNumbers
    const existingVisitedNumbers = currentData.visitedNumbers || [];
    if (existingVisitedNumbers.includes(slotNumber)) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "Slot number already visited",
      });
    }
    // Create a new array with unique values
    const updatedArray = Array.isArray(existingVisitedNumbers)
      ? [...new Set([...existingVisitedNumbers, slotNumber])]
      : [slotNumber];

    // 2. Update the array by adding the new slotNumber if it doesn't already exist
    const { data, error } = await supabaseServer
      .from("channel")
      .update({
        currentNumber: slotNumber,
        visitedNumbers: updatedArray,
      })
      .eq("id", channelId)

      .select("*")
      .maybeSingle();
    if (error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: error.message,
      });
    }
    return NextResponse.json({
      data: data,
      success: true,
      message: "Channel visited number updated successfully",
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
