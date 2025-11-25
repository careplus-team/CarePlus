import {NextRequest,NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/admin";


export async function POST(req: NextRequest){
     try{
        const body = await req.json() as { email: string; status: boolean };
        const { email, status } = body;

        if (!email || status === undefined) {
            return NextResponse.json(
                {success:false, message:"Email and status are required"},
                {status:400}

            );

        }


        //Update the doctor's verification status in the database
        const {data,error } = await supabaseServer
        .from("doctor")
        .update({verification:status})
        .eq("email", email)
        .select()
        .maybeSingle();
         
        if (error) {
            return NextResponse.json(
                {success:false, message:error.message},
                {status:500}
            );
     }

     if (!data) {
        return NextResponse.json(
            {success:false, message:"Doctor not found"},
            {status:404}
        );
     }
        return NextResponse.json({
            success:true,
            message:`Doctor has been ${status ? "approved" : "disapproved"}`,
            data
        });
        }
        catch (error) {
         console.error(error);
         return NextResponse.json(
            {success:false, message:"Internal Server Error"},
            {status:500}
            );


        }


}   // Important notice to frontend developers:email and status should pass from the frontend