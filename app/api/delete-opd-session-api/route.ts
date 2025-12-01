import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";

export async function POST() {
  try {
    // Fetch the current OPD session (Assume that always there is only one session record within opdsession table)
    const getCurrentSession = await supabaseServer
      .from("opdsession")
      .select("id")
      .maybeSingle();

    if (getCurrentSession.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: getCurrentSession.error.message,
      });
    }
    // Check if a session exists to delete
    if (!getCurrentSession.data) {
      return NextResponse.json({
        data: null,
        success: false,
        message: "No OPD session found to delete",
      });
    }

    console.log("Current Session:", getCurrentSession.data);

    // Delete the OPD session with the specified ID
    const deleteResponse = await supabaseServer
      .from("opdsession")
      .delete()
      .eq("id", getCurrentSession.data?.id);
    console.log(deleteResponse);

    // Check for errors during deletion
    if (deleteResponse.error) {
      return NextResponse.json({
        data: null,
        success: false,
        message: deleteResponse.error.message,
      });
    }
    // Return success response upon successful deletion
    return NextResponse.json({
      data: deleteResponse.data,
      success: true,
      message: "OPD session deleted successfully",
    });
  } catch (e) {
    return NextResponse.json(
      {
        message: "Internal server error",
        data: e instanceof Error ? e.message : "Unknown error",
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
