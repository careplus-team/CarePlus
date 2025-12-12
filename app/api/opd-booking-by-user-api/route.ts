import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { userEmail } = await req.json();
  try {
    // Fetch the current active OPD session
    // Assuming there is only one active session or we pick the first one
    const sessionData = await supabaseServer
      .from("opdsession")
      .select("id, numberOfPatientsSlots, lastIssuedToken, orginalSlotsCount")
      .maybeSingle();

    if (sessionData.error) {
      return NextResponse.json({
        success: false,
        message: sessionData.error.message,
      });
    }

    if (!sessionData.data) {
      return NextResponse.json({
        success: false,
        message: "No active OPD session found.",
      });
    }

    const { id, numberOfPatientsSlots, lastIssuedToken, orginalSlotsCount } =
      sessionData.data;

    // Check if we have reached capacity (Total tickets issued >= Total Capacity)
    if ((lastIssuedToken || 0) >= (orginalSlotsCount || 0)) {
      return NextResponse.json({
        success: false,
        message: "OPD Session is full. No more tickets can be issued.",
      });
    }

    // Calculate new values
    const newTicketNumber = (lastIssuedToken || 0) + 1;
    // We DO NOT increment numberOfPatientsSlots here. That tracks the doctor's progress.

    // Update the session
    const updateResult = await supabaseServer
      .from("opdsession")
      .update({
        lastIssuedToken: newTicketNumber,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateResult.error) {
      return NextResponse.json({
        success: false,
        message: updateResult.error.message,
      });
    }

    //update opd_booking table with userEmail , ticketNumber
    const bookingResult = await supabaseServer
      .from("opd_booking")
      .insert({
        patientEmail: userEmail,
        bookingNumber: newTicketNumber,
        sessionId: id,
      })
      .select()
      .single();

    if (bookingResult.error) {
      return NextResponse.json({
        success: false,
        message: bookingResult.error.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Ticket issued successfully.",
      ticketNumber: newTicketNumber,
      remainingSlots: (orginalSlotsCount || 0) - newTicketNumber,
    });
  } catch (error) {
    console.error("Error issuing ticket:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
