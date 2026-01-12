import { supabaseServer } from "../supabase/admin";

const checkAmbulanceExists = async (licensePlate: string) => {
  const { data, error } = await supabaseServer
    .from("ambulance")
    .select("license_plate")
    .eq("license_plate", licensePlate)
    .maybeSingle();

  if (error) {
    console.error("Check ambulance exists error:", error);
    return false;
  }

  return !!data;
};

export default checkAmbulanceExists;
