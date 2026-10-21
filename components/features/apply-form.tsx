"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { applyToBatch } from "@/lib/actions/apply";
import type { FormState } from "@/lib/validation";

export function ApplyForm({ batchId }: { batchId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(applyToBatch, { ok: true });
  return (
    <form action={action} className="mt-6 border-t border-line pt-6">
      <input type="hidden" name="batchId" value={batchId} />
      {state.message ? (
        <p role="alert" className="mb-4 border-l-2 border-danger pl-3 text-sm text-danger">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
