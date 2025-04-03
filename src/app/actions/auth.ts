"use server";

import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error };
  }

  redirect("/garage");
}
