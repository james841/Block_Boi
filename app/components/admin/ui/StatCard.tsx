import { type LucideIcon } from "lucide-react";

type Tone = "indigo" | "emerald" | "amber" | "rose" | "slate";

const TONE_MAP: Record<Tone, string> = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  slate: "bg-slate-100 text-slate-600",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "indigo",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${TONE_MAP[tone]}`}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <p className="text-[13px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
