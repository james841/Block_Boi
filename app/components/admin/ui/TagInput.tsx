import { X } from "lucide-react";

export default function TagInput({
  label,
  values,
  onChange,
  onRemove,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string) => void;
  onRemove: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-3 text-sm font-semibold text-slate-800">{label}</h2>
      <input
        type="text"
        defaultValue={values.join(", ")}
        onBlur={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
          >
            {v}
            <button type="button" onClick={() => onRemove(v)}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
