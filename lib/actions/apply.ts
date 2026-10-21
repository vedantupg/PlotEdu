"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uuidSchema, type FormState } from "@/lib/validation";

/** Submit a batch application via apply_to_batch() (onboarding + open-batch checks in SQL). */
export async function applyToBatch(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = uuidSchema.safeParse(formData.get("batchId"));
  if (!isSupabaseConfigured()) return { ok: false, message: "Applying needs Supabase configured (demo mode)." };
  if (!parsed.success) return { ok: false, message: "Unknown batch." };

  const viewer = await getViewer();
  if (!viewer) redirect(`/sign-in?next=${encodeURIComponent(`/apply/${parsed.data}`)}`);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("apply_to_batch", { p_batch_id: parsed.data });
  if (error) {
    // P0001 messages are written for humans in SQL.
    return {
      ok: false,
      message: error.code === "P0001" ? error.message : "Could not submit your application. Please try again.",
    };
  }
  revalidatePath("/home");
  redirect("/home?applied=1");
}
