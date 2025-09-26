import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const noOfUsers = await supabaseServer
      .from("user")
      .select("*", { count: "exact", head: true });

    const noOfAdmins = await supabaseServer
      .from("user")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    const noOfDoctors = await supabaseServer
      .from("doctor")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      noOfUsers: noOfUsers.count,
      noOfAdmins: noOfAdmins.count,
      noOfDoctors: noOfDoctors.count,
      success: true,
      message: "User counts fetched successfully",
    });
  } catch (e) {
    return NextResponse.json({
      noOfUsers: 0,
      noOfAdmins: 0,
      noOfDoctors: 0,
      success: false,
      message: "An error occurred while fetching user counts",
    });
  }
}
