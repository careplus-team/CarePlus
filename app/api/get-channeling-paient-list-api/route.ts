
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({ error: "doctorId is required" });
    }

    const { data, error } = await supabase
      .from("patient_channeling")
      .select(`
        id,
        patientNumber,
        patientName,
        channel:channelId (
          id,
          name,
        )
      `)
      .eq("channel.doctorId", doctorId) 
      .order("patientNumber", { ascending: true });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
}
