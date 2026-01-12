import { supabaseServer } from "@/lib/supabase/admin";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { id, email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Doctor Email is required" },
        { status: 400 }
      );
    }

    // 1. Delete from Supabase Auth
 
    
    // Attempt to get user by email directly (if supported or iterate)
    let authUserId = null;
    
    // Method: List users and filter (works for smaller/medium userbases) 


    const { data: authData, error: authListError } = await supabaseServer.auth.admin.listUsers();
    
    if (authListError) {
        console.error("Auth Find Error:", authListError);
        // We continue to delete from DB even if Auth fails? 
        // User requested "also delete from supabase auth". 
        // We should try best effort.
    } else {
        const user = authData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (user) {
            authUserId = user.id;
        }
    }

    if (authUserId) {
        const { error: deleteAuthError } = await supabaseServer.auth.admin.deleteUser(authUserId);
        if (deleteAuthError) {
             console.error("Auth Delete Error:", deleteAuthError);
             return NextResponse.json(
                { success: false, message: "Failed to delete user from Auth System: " + deleteAuthError.message },
                { status: 500 }
            );
        }
    } else {
        // console.log("User not found in Auth system, proceeding to delete DB record only.");
    }

    // 2. Delete from Database
    let query = supabaseServer.from("doctor").delete();

    if (id) {
      query = query.eq("id", id);
    } else {
      query = query.eq("email", email);
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Doctor account deleted successfully (Auth & DB)",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error },
      { status: 500 }
    );
  }
}
