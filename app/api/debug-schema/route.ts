import { supabaseServer } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Try to fetch one row from emergency_request to see columns
    const { data, error } = await supabaseServer
      .from("emergency_request")
      .select("*")
      .limit(1);

    if (error) {
        // Try plural
        const { data: data2, error: error2 } = await supabaseServer
        .from("emergency_requests")
        .select("*")
        .limit(1);
        
        if (error2) {
            return NextResponse.json({ error: error.message, error2: error2.message });
        }
        return NextResponse.json({ table: "emergency_requests", data: data2 });
    }

    return NextResponse.json({ table: "emergency_request", data });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" });
  }
}
