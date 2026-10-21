"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, buttonClass } from "@/components/ui/button";
import { saveOnboarding } from "@/lib/actions/profile";
import type { FormState } from "@/lib/validation";

type Defaults = { fullName: string; collegeOrFirm: string; city: string };

export function OnboardingForm({ defaults, next }: { defaults: Defaults; next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveOnboarding, { ok: true });
  const err = (k: keyof Defaults): string | undefined => state.fieldErrors?.[k]?.[0];

  const fields: { name: keyof Defaults; label: string; autoComplete: string; placeholder: string }[] = [
    {
      name: "fullName",
      label: "Full name",
      autoComplete: "name",
      placeholder: "As it should appear on your certificate",
    },
    {
      name: "collegeOrFirm",
      label: "College or firm",
      autoComplete: "organization",
      placeholder: "e.g. BNCA Pune, or your studio",
    },
    { name: "city", label: "City", autoComplete: "address-level2", placeholder: "e.g. Pune" },
  ];

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="text-sm font-semibold">
            {f.label}
          </label>
          <input
            id={f.name}
            name={f.name}
            defaultValue={defaults[f.name]}
            autoComplete={f.autoComplete}
            placeholder={f.placeholder}
            aria-invalid={Boolean(err(f.name))}
            aria-describedby={err(f.name) ? `${f.name}-error` : undefined}
            className="field mt-1.5"
          />
          {err(f.name) ? (
            <p id={`${f.name}-error`} className="mt-1 text-sm text-danger">
              {err(f.name)}
            </p>
          ) : null}
        </div>
      ))}
      {state.message ? (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      ) : null}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center">
        <Link href={next} className={buttonClass({ variant: "ghost" })}>
          Skip for now
        </Link>
        <Button type="submit" disabled={pending} className="sm:ml-auto">
          {pending ? "Saving…" : "Save and continue"}
        </Button>
      </div>
    </form>
  );
}
