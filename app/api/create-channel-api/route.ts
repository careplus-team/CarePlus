import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      doctorName,
      doctorEmail,
      date,
      time,
      totalSlots,
      state,
      roomNumber,
      estimateWaitingTime,
      description,
      remainingSlots,
      currentNumber,
    } = await req.json();

    const createdChannelData = await supabaseServer
      .from("channel")
      .insert({
        name,
        doctorName,
        doctorEmail,
        date,
        time,
        totalSlots,
        state,
        roomNumber,
        estimateWaitingTime,
        description,
        remainingSlots,
        currentNumber,
      })
      .select("*")
      .maybeSingle();

    if (createdChannelData.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: createdChannelData.error.message,
      });
    }
    return NextResponse.json({
      data: createdChannelData.data,
      success: true,
      message: "Channel created successfully",
    });
  } catch (e) {
    return NextResponse.json(
      { message: "Internal server error", data: null, success: false },
      { status: 500 }
    );
  }
}
