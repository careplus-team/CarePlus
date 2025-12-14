import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await (await supabase).auth.getUser();

  if (!user || authError) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data, error } = await (await supabase)
    .from("patient_channeling")
    .select(`
      id,
      patientNumber,
      channel:channelId (
        id,
        name,
        roomNumber,
        currentNumber,
        description,
        estimateWaitingTime
      )
    `)
    .eq("patientEmail", user.email)
    .eq("state", true);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
