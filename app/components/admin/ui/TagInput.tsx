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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm max-w-md">
      {/* Semantic label with better spacing */}
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      
      {/* Input styling assuming 'input' global class wasn't fully styled */}
      <input
        type="text"
        defaultValue={values.join(", ")}
        onBlur={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
      />
      
      {/* Refined pill container */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-100 pl-2.5 pr-1 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            {v}
            <button 
              type="button" 
              onClick={() => onRemove(v)}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}