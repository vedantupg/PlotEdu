import { z } from "zod";

export const onboardingSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  collegeOrFirm: z.string().trim().min(2, "Enter your college or firm").max(160),
  city: z.string().trim().min(2, "Enter your city").max(80),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const uuidSchema = z.uuid();

export type FormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
