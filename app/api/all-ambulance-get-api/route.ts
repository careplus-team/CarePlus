import { supabaseServer } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";


export async function GET() {
  try {
    // 1. Fetch all ambulances
    const { data: ambulances, error: ambError } = await supabaseServer
      .from("ambulance")
      .select("*")
      .order("created_at", { ascending: false });

    if (ambError) {
      return NextResponse.json(
        { success: false, message: ambError.message },
        { status: 500 }
      );
    }

    // 2. Fetch active emergency requests for these ambulances
    // We assume 'status' column exists and we exclude completed/cancelled ones.
    const ambulanceIds = ambulances.map((a) => a.id);
    let requests: any[] = [];
    
    if (ambulanceIds.length > 0) {
        // Use exact columns from screenshot: latitude, longitude, ambulanceId (camelCase), status
        const { data: reqData, error: reqError } = await supabaseServer
        .from("emergency_request")
        .select("id, ambulanceId, latitude, longitude, status")
        // Use implicit filter or manual filter if .in() fails on mixed case column names in some supabase versions, 
        // but typically it works. We'll stick to standard syntax.
        .in("ambulanceId", ambulanceIds) 
        .not("status", "in", "(Completed,Cancelled)"); 
        
        if (!reqError && reqData) {
            requests = reqData;
        }
    }

    // 3. Merge data
    const mergedData = ambulances.map((amb) => {
        // Match using camelCase ambulanceId
        const activeReq = requests.find((r) => r.ambulanceId === amb.id);
        return {
            ...amb,
            active_request: activeReq ? {
                id: activeReq.id,
                // Create a formatted location string or just pass coords. 
                // We'll pass coords primarily.
                latitude: activeReq.latitude,
                longitude: activeReq.longitude,
                status: activeReq.status
            } : null
        };
    });

    return NextResponse.json({
      success: true,
      message: "Ambulance data fetched successfully",
      data: mergedData,
    });
  } catch (error) {
    console.error("GET ambulance error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}