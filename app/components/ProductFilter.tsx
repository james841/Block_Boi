import { Sparkles } from "lucide-react";

type FilterProps = {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
};

const filters = [
  { id: "all", label: "ALL", emoji: "✨" },
  { id: "shorts", label: "SHORTS", emoji: "🩳" },
  { id: "jackets", label: "JACKETS", emoji: "🧥" },
  { id: "pants", label: "PANTS", emoji: "👖" },
  { id: "shirts", label: "SHIRT", emoji: "👕" },
  { id: "hat", label: "HAT", emoji: "🧢" },
];

export default function ProductFilter({ activeFilter, onFilterChange }: FilterProps) {
  return (
    <div className="relative mb-12 overflow-x-auto pb-2">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        * {
          font-family: 'Poppins', sans-serif;
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .shimmer-bg {
          background: linear-gradient(90deg, #FF6B6B 0%, #C44569 25%, #8E44AD 50%, #3498DB 75%, #FF6B6B 100%);
          background-size: 200% auto;
          animation: shimmer 2.5s linear infinite;
        }

        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 mr-2">
          <Sparkles className="w-5 h-5 text-[#8E44AD] float-animation" />
          <span className="text-sm font-semibold text-[#4B3F72] tracking-wider">FILTER:</span>
        </div>

        {filters.map((filter, index) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            style={{ animationDelay: `${index * 0.1}s` }}
            className={`group relative px-6 py-3 rounded-2xl text-sm font-bold tracking-wide transition-all duration-500 ease-out transform focus:outline-none focus:ring-2 focus:ring-[#8E44AD] border-2 ${
              activeFilter === filter.id
                ? "scale-105 shadow-2xl border-[#FF6B6B]"
                : "hover:scale-105 hover:shadow-xl border-[#8E44AD]"
            }`}
          >
            {activeFilter === filter.id ? (
              <>
                <div className="absolute inset-0 shimmer-bg rounded-2xl opacity-100"></div>
                <div className="relative flex items-center gap-2 text-white z-10">
                  <span className="text-lg">{filter.emoji}</span>
                  <span>{filter.label}</span>
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-[#FDF6EC] via-white to-[#FDF6EC] rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#8E44AD]/0 via-[#FF6B6B]/0 to-[#3498DB]/0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                <div className="relative flex items-center gap-2 text-[#4B3F72] group-hover:text-[#8E44AD] z-10">
                  <span className="text-lg transform group-hover:scale-125 transition-transform duration-300">
                    {filter.emoji}
                  </span>
                  <span>{filter.label}</span>
                </div>
              </>
            )}

            {activeFilter === filter.id && (
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6B6B] via-[#8E44AD] to-[#3498DB] rounded-2xl opacity-30 blur-lg"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}