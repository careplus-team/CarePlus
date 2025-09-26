import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { success } from "zod";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const isAlreadyNotAdmin = await supabaseServer
      .from("user")
      .select("*")
      .eq("email", email)
      .eq("role", "user")
      .maybeSingle();
    console.log(isAlreadyNotAdmin);

    if (isAlreadyNotAdmin.data) {
      return NextResponse.json({
        data: null,
        error: "User is already not an admin",
        success: false,
      });
    }

    const removeAdmin = await supabaseServer
      .from("user")
      .update({
        role: "user",
      })
      .eq("email", email)
      .select()
      .maybeSingle();

    if (removeAdmin.data === null) {
      return NextResponse.json({
        data: null,
        error: "No user found with the provided email",
        success: false,
      });
    }
    return NextResponse.json({
      data: removeAdmin.data,
      success: true,
      message: "Admin removed successfully",
    });

    console.log(removeAdmin);
  } catch (e) {
    return NextResponse.json({ error: "Failed to remove admin" });
  }
}
