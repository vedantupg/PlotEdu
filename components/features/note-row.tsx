import Link from "next/link";
import { IconDownload, IconLock } from "@/components/brand/icons";
import { buttonClass } from "@/components/ui/button";
import { Sep } from "@/components/ui/sep";
import { LOCK_COPY, type AccessDecision } from "@/lib/access";
import type { Note } from "@/lib/data/types";
import { cn, formatBytes, mimeLabel, moduleCode } from "@/lib/utils";

const ACCESS_LABEL: Record<Note["access"], string> = {
  public: "Free",
  members: "Free for members",
  batch: "Enrolled students",
  staff: "Staff",
};

function unlock(decision: Extract<AccessDecision, { allowed: false }>): { href: string; label: string } | null {
  if (decision.reason === "sign_in") return { href: "/sign-in?next=/notes", label: "Sign in" };
  if (decision.reason === "enrol") return { href: "/home", label: "Apply" };
  return null;
}

/** Drawing-sheet tile showing the file type, like a title block. */
function SheetTile({ mime, locked }: { mime: string; locked: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative grid h-14 w-11 shrink-0 place-items-end rounded-[6px] border bg-surface-2 p-1.5",
        locked ? "border-line text-muted" : "border-line-strong text-fg",
      )}
    >
      <span className="absolute right-0 top-0 size-3 rounded-bl-[4px] border-b border-l border-inherit bg-ink/40" />
      <span className="survey !text-[0.5625rem] !tracking-[0.08em]">{mimeLabel(mime)}</span>
    </div>
  );
}

/** A note in the library. Locked items stay visible with a reason and a path. */
export function NoteRow({ note, decision, highlight }: { note: Note; decision: AccessDecision; highlight?: boolean }) {
  const locked = !decision.allowed;
  const path = locked ? unlock(decision) : null;
  const free = note.access === "public" || note.access === "members";

  return (
    <li id={note.id} className={cn("card scroll-mt-24 p-4 sm:p-5", highlight && "border-accent")}>
      <div className="flex gap-4">
        <SheetTile mime={note.mime} locked={locked} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-muted">
            {note.module ? (
              <span>
                {moduleCode(note.module.order).replace("MODULE", "Module")}
                <Sep />
                {note.module.title}
              </span>
            ) : null}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                free ? "bg-success/12 text-success" : "bg-surface-3 text-fg-soft",
              )}
            >
              {ACCESS_LABEL[note.access]}
            </span>
          </div>
          <h3 className="mt-1 text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em]">{note.title}</h3>
          {note.description ? <p className="mt-1 text-[0.9375rem] text-muted">{note.description}</p> : null}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="survey text-muted">{formatBytes(note.sizeBytes)}</span>
            {locked ? (
              <p className="flex items-center gap-2 text-sm text-fg-soft">
                <IconLock width={16} height={16} className="shrink-0 text-accent-ink" />
                <span>{LOCK_COPY[decision.reason]}</span>
                {path ? (
                  <Link
                    href={path.href}
                    className="font-semibold text-fg underline decoration-accent decoration-2 underline-offset-4"
                  >
                    {path.label}
                  </Link>
                ) : null}
              </p>
            ) : (
              <a
                href={`/api/notes/${note.id}/download`}
                className={buttonClass({ variant: "secondary", size: "md" })}
                aria-label={`Download ${note.title}`}
              >
                <IconDownload width={18} height={18} /> Download
              </a>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
