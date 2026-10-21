"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getViewer } from "@/lib/auth/viewer";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/utils";
import { onboardingSchema, type FormState } from "@/lib/validation";

/** Save the 3-field onboarding profile, then continue to `next`. */
export async function saveOnboarding(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = onboardingSchema.safeParse({
    fullName: formData.get("fullName"),
    collegeOrFirm: formData.get("collegeOrFirm"),
    city: formData.get("city"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const next = safeNextPath(formData.get("next")?.toString());

  if (isSupabaseConfigured()) {
    const viewer = await getViewer();
    if (!viewer) redirect(`/sign-in?next=${encodeURIComponent("/onboarding")}`);
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        college_or_firm: parsed.data.collegeOrFirm,
        city: parsed.data.city,
        onboarded_at: viewer.profile.onboardedAt ?? new Date().toISOString(),
      })
      .eq("id", viewer.profile.id);
    if (error) return { ok: false, message: "Could not save your profile. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect(next);
}
