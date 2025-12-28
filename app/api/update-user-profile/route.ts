import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();
    if (!data?.email) {
      return NextResponse.json(
        { success: false, message: "Missing email" },
        { status: 400 }
      );
    }

    // Remove undefined keys
    const payload: any = {};
    const allowed = [
      "name",
      "mobilenumber",
      "username",
      "dateofbirth",
      "age",
      "gender",
      "address",
      "profilePicture",
    ];
    for (const k of allowed) {
      if (k in data) payload[k] = data[k] === "" ? null : data[k];
    }

    const updated = await supabaseServer
      .from("user")
      .update(payload)
      .eq("email", data.email)
      .select()
      .single();

    if (updated.error) {
      return NextResponse.json({
        success: false,
        message: updated.error.message,
      });
    }

    return NextResponse.json({
      success: true,
      data: updated.data,
      message: "User updated",
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : "Unknown" },
      { status: 500 }
    );
  }
}
