import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { content } = await req.json();

  try {
    const createdData = await supabaseServer
      .from("healthtip")
      .insert({
        content: content,
      })
      .select();

    return NextResponse.json({
      message: "Health Tip Successfully Created",
      data: createdData,
      success: true,
    });
  } catch (e) {
    return NextResponse.json({
      message: "Error Occured While Creating Health Tip",
      success: false,
      data: null,
    });
  }
}
