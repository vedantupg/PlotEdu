import { IconCalendarPlus } from "@/components/brand/icons";
import { buttonClass, type ButtonSize } from "@/components/ui/button";
import { SITE_URL } from "@/lib/env";
import { googleCalendarTemplateUrl } from "@/lib/session-state";
import { cn } from "@/lib/utils";

type Props = {
  sessionId: string;
  title: string;
  startsAt: Date;
  durationMin: number;
  variant?: "ghost" | "secondary";
  size?: ButtonSize;
  className?: string;
};

/**
 * Google Calendar link + .ics download (Apple Calendar, Outlook). Uses <details>
 * so it works without JS. Both point back to the dashboard, never the Meet link.
 */
export function AddToCalendar({
  sessionId,
  title,
  startsAt,
  durationMin,
  variant = "ghost",
  size = "lg",
  className,
}: Props) {
  const google = googleCalendarTemplateUrl({
    title: `PlotEdu · ${title}`,
    startsAt,
    durationMin,
    details: `Join from your PlotEdu dashboard: ${SITE_URL}/sessions/${sessionId}`,
  });
  const item = "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-surface-2";
  return (
    <details className={cn("group relative", className)}>
      <summary
        className={cn(buttonClass({ variant, size }), "cursor-pointer list-none [&::-webkit-details-marker]:hidden")}
      >
        <IconCalendarPlus width={18} height={18} /> Add to calendar
      </summary>
      <div className="card-raised absolute left-0 z-30 mt-2 w-60 p-1.5 animate-fade-up sm:left-auto sm:right-0">
        <a href={google} target="_blank" rel="noreferrer" className={item}>
          <span aria-hidden className="grid size-7 place-items-center rounded-md bg-surface-3 text-xs font-bold">
            G
          </span>
          Google Calendar
        </a>
        <a href={`/api/sessions/${sessionId}/ics`} download className={item}>
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-md bg-surface-3 text-[0.625rem] font-bold"
          >
            ICS
          </span>
          Apple / Outlook (.ics)
        </a>
      </div>
    </details>
  );
}
