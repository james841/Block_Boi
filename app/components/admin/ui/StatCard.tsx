import { type LucideIcon } from "lucide-react";

type Tone = "orange" | "emerald" | "amber" | "rose" | "stone";

const TONE_MAP: Record<Tone, string> = {
  orange: "bg-orange-50 text-orange-500 border border-orange-100",
  emerald: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  amber: "bg-amber-50 text-amber-600 border border-amber-100",
  rose: "bg-rose-50 text-rose-600 border border-rose-100",
  stone: "bg-stone-100 text-stone-600 border border-stone-200/60",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "orange",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <div className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-stone-300/80">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${TONE_MAP[tone]}`}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <p className="text-[13px] font-semibold text-stone-400 tracking-tight">{label}</p>
      <p className="mt-1 text-2xl font-black text-stone-950 tracking-tight">{value}</p>
    </div>
  );
}