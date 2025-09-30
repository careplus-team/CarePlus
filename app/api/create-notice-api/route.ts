import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { title, content, piority } = await req.json();

  try {
    const createdData = await supabaseServer
      .from("notice")
      .insert({
        title: title,
        content: content,
        piority: piority || "low",
      })
      .select();

    return NextResponse.json({
      message: "Notice Successfully Created",
      data: createdData,
      success: true,
    });
  } catch (e) {
    return NextResponse.json({
      message: "Error Occured While Creating Notice",
      success: false,
      data: null,
    });
  }
}
