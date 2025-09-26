import { createClient } from "../supabase/client";

export const fetchUserInfoFromAuth = async () => {
  const client = createClient();
  const userAuthInfo = await client.auth.getClaims();
  if (userAuthInfo?.data?.claims?.email != null) {
    return userAuthInfo;
  } else {
    return null;
  }
};
