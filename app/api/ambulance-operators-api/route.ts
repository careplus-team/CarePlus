import { supabaseServer } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

// GET all ambulance operators with their current ambulance assignment
export async function GET() {
  try {
    // 1. Get all users with role = ambulance_operator
    const { data: operators, error: opError } = await supabaseServer
      .from("user")
      .select("email, name")
      .eq("role", "ambulance_operator");

    if (opError) {
      return NextResponse.json(
        { success: false, message: opError.message },
        { status: 500 },
      );
    }

    // 2. Get all existing ambulance_operator assignments
    const { data: assignments, error: assignError } = await supabaseServer
      .from("ambulance_operator")
      .select("userEmail, ambulanceId");

    if (assignError) {
      return NextResponse.json(
        { success: false, message: assignError.message },
        { status: 500 },
      );
    }

    // 3. Merge: attach ambulanceId to each operator
    const result = (operators || []).map((op) => {
      const assignment = (assignments || []).find(
        (a) => a.userEmail === op.email,
      );
      return {
        email: op.email,
        name: op.name || null,
        ambulanceId: assignment?.ambulanceId || null,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
