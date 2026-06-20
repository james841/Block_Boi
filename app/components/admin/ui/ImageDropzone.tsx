"use client";

import { useRef } from "react";
import { Upload, X } from "lucide-react";

export default function ImageDropzone({
  preview,
  onFile,
  onRemove,
  label = "Image",
  required,
  hint = "JPG, PNG, WebP",
  heightClass = "h-56",
}: {
  preview: string;
  onFile: (file: File) => void;
  onRemove: () => void;
  label?: string;
  required?: boolean;
  hint?: string;
  heightClass?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !preview && inputRef.current?.click()}
        className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
          preview
            ? "border-transparent"
            : "cursor-pointer border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />

        {preview ? (
          <div className={`group relative w-full ${heightClass}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute right-3 top-3 rounded-lg bg-white/90 p-2 text-slate-600 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:text-rose-600"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-medium text-transparent transition-all hover:bg-black/40 hover:text-white"
            >
              Click to replace
            </button>
          </div>
        ) : (
          <div className={`flex ${heightClass} flex-col items-center justify-center gap-2 text-center`}>
            <Upload className="h-8 w-8 text-slate-400" />
            <p className="text-sm text-slate-500">Drop image here or click to upload</p>
            <p className="text-xs text-slate-400">{hint} • Max 5MB</p>
          </div>
        )}
      </div>
    </div>
  );
}
