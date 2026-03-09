import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// POST: Assign an ambulance_operator to an ambulance
export async function POST(req: NextRequest) {
  try {
    const { operatorEmail, ambulanceId } = await req.json();

    if (!operatorEmail || !ambulanceId) {
      return NextResponse.json(
        {
          success: false,
          message: "operatorEmail and ambulanceId are required",
        },
        { status: 400 },
      );
    }

    // 1. Verify the user is an ambulance_operator
    const { data: opUser } = await supabaseServer
      .from("user")
      .select("email")
      .eq("email", operatorEmail)
      .eq("role", "ambulance_operator")
      .maybeSingle();

    if (!opUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User is not a registered ambulance operator",
        },
        { status: 400 },
      );
    }

    // 2. Remove any existing assignment for this operator (one operator = one ambulance)
    await supabaseServer
      .from("ambulance_operator")
      .delete()
      .eq("userEmail", operatorEmail);

    // 3. Remove any existing assignment for the target ambulance (one ambulance = one operator)
    await supabaseServer
      .from("ambulance_operator")
      .delete()
      .eq("ambulanceId", ambulanceId);

    // 4. Insert the new assignment
    const { error: insertError } = await supabaseServer
      .from("ambulance_operator")
      .insert({ userEmail: operatorEmail, ambulanceId });

    if (insertError) {
      return NextResponse.json(
        { success: false, message: insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Operator assigned to ambulance successfully",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
