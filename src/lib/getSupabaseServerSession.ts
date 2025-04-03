// lib/getSupabaseServerSession.ts
import { supabase } from "./supabase";

export async function getSupabaseServerSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}
