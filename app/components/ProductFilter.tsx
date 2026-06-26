"use client";

import { Sparkles } from "lucide-react";

type FilterProps = {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  // Pass the actual categories from your products instead of hardcoding them
  categories?: string[];
};

export default function ProductFilter({ activeFilter, onFilterChange, categories = [] }: FilterProps) {
  // Build filter list dynamically from real product categories
  const filters = [
    { id: "all", label: "ALL" },
    ...categories.map((cat) => ({
      id: cat.toLowerCase(),
      label: cat.toUpperCase(),
    })),
  ];

  return (
    <div className="relative mb-12">
      <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12 overflow-x-auto no-scrollbar pb-4">
        
        {/* Label */}
        <div className="flex items-center gap-3 shrink-0">
          <Sparkles className="w-4 h-4 text-black" strokeWidth={1.5} />
          <span className="text-[10px] font-black tracking-[0.4em] text-black/30 uppercase">
            Sort By
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-8 md:gap-10">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className="group relative flex flex-col items-start transition-all duration-300"
            >
              <span
                className={`text-[11px] font-black tracking-[0.25em] uppercase transition-colors duration-300 ${
                  activeFilter === filter.id
                    ? "text-black"
                    : "text-black/40 hover:text-black"
                }`}
              >
                {filter.label}
              </span>
              <span
                className={`h-[2px] mt-1.5 transition-all duration-500 ease-in-out ${
                  activeFilter === filter.id
                    ? "w-full bg-black"
                    : "w-0 bg-black/20 group-hover:w-1/2"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-0 w-full h-[1px] bg-black/5 -z-10" />
    </div>
  );
}