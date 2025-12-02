import { supabaseServer } from "../supabase/admin";

const checkUserExists = async (userEmail: string) => {
  const isUserExists = await supabaseServer
    .from("user")
    .select("email")
    .eq("email", userEmail)
    .maybeSingle();
  if (isUserExists.data) {
    return true;
  } else {
    return false;
  }
};

export default checkUserExists;
