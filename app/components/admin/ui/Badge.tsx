type Tone = "amber" | "sky" | "emerald" | "slate" | "rose";

const TONE_MAP: Record<Tone, string> = {
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
};

export const STATUS_TONE: Record<string, Tone> = {
  pending: "amber",
  processing: "sky",
  completed: "emerald",
  cancelled: "slate",
};

export default function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${TONE_MAP[tone]}`}
    >
      {children}
    </span>
  );
}
