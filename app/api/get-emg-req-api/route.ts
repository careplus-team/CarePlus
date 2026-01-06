import { NextRequest , NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/admin";


export async function GET() {
    try {
        const emergencyRequestsData = await supabaseServer.from("emergency_request").select("*");
        if(!emergencyRequestsData.data){
            return NextResponse.json({
                data: null,
                success: false,
                message: "No emergency requests found",
            })
        }
        return NextResponse.json({
            data: emergencyRequestsData.data,
            success: true,
            message: "Emergency requests fetched successfully",
        })          
    } catch (error) {

        return NextResponse.json({
            data: null,
            success: false,
            message: "An error occurred while fetching emergency requests",
        })
    }
}