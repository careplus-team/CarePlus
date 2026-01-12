import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";
import checkAmbulanceExists from "@/lib/helper/check-ambulance-exists";

export async function POST(req: NextRequest) {
  try {
    const { license_plate } = await req.json();

    if (!license_plate) {
      return NextResponse.json({
        success: false,
        data: null,
        message: "License plate is required",
      });
    }

    // Check if ambulance exists
    const ambulanceExists = await checkAmbulanceExists(license_plate);

    if (!ambulanceExists) {
      return NextResponse.json({
        success: false,
        data: null,
        message: "Ambulance not found",
      });
    }

    // Delete ambulance
    const deletedAmbulance = await supabaseServer
      .from("ambulance")
      .delete()
      .eq("license_plate", license_plate)
      .select("*")
      .maybeSingle();

    if (deletedAmbulance.error) {
      return NextResponse.json({
        success: false,
        data: null,
        message: deletedAmbulance.error.message,
      });
    }

    return NextResponse.json({
      success: true,
      data: deletedAmbulance.data,
      message: "Ambulance deleted successfully",
    });
  } catch (error) {
    console.error("Delete ambulance error:", error);
    return NextResponse.json({
      success: false,
      data: null,
      message: "An error occurred while deleting the ambulance",
    });
  }
}
