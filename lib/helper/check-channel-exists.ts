import { supabaseServer } from "../supabase/admin";

const checkChannelExists = async (channelId: string) => {
  const channelData = await supabaseServer
    .from("channel")
    .select("id")
    .eq("id", channelId)
    .maybeSingle();

  if (channelData.data) {
    return true;
  } else {
    return false;
  }
};

export default checkChannelExists;
