"use client";

import { useState } from "react";
import { X, Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";

type Props = {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (cats: string[]) => void;
};

export default function ProductSelect({
  categories,
  selectedCategories,
  onCategoryChange,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCategoryChange = (cat: string, checked: boolean) => {
    if (checked) {
      onCategoryChange([...selectedCategories, cat]);
    } else {
      onCategoryChange(selectedCategories.filter((c) => c !== cat));
    }
  };

  const clearAllFilters = () => {
    onCategoryChange([]);
  };

  const CategoryList = () => (
    <div className="space-y-2">
      {categories.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No categories available
        </p>
      ) : (
        categories.map((cat) => (
          <label
            key={cat}
            className="flex items-center gap-3 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-xl transition-all group"
          >
            <Checkbox
              checked={selectedCategories.includes(cat)}
              onCheckedChange={(checked) =>
                handleCategoryChange(cat, !!checked)
              }
              className="border-2 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
            <span className="capitalize text-gray-700 dark:text-gray-300 font-medium group-hover:text-orange-500 transition-colors">
              {cat}
            </span>
          </label>
        ))
      )}
    </div>
  );

  const DesktopSidebar = () => (
    <aside className="hidden lg:block w-72 space-y-6 sticky top-24 self-start">
      {/* Categories Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-orange-500" />
            Categories
          </h3>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => onCategoryChange([])}
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        <CategoryList />
      </div>

      {/* Active Filters */}
      {selectedCategories.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-200 dark:border-orange-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              Active Filters
            </h4>
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {selectedCategories.map((cat) => (
              <div
                key={cat}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 capitalize">
                  {cat}
                </span>
                <button
                  onClick={() => handleCategoryChange(cat, false)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );

  const MobileDrawer = () => (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="lg:hidden flex items-center gap-2 font-semibold border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
        >
          <Filter className="w-5 h-5" />
          Filters & Categories
          {selectedCategories.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
              {selectedCategories.length}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-80 sm:w-96 p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <SheetTitle className="sr-only">Filters and Categories</SheetTitle>
          <SheetDescription className="sr-only">
            Select categories to filter products. Active filters are shown at
            the top and can be cleared individually or all at once.
          </SheetDescription>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xl font-bold">
              <Filter className="w-6 h-6" />
              Filters
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {/* Active Filters in Mobile */}
          {selectedCategories.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Active Filters
                </h4>
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2">
                {selectedCategories.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg text-sm"
                  >
                    <span className="flex-1 capitalize text-gray-700 dark:text-gray-300">
                      {cat}
                    </span>
                    <button
                      onClick={() => handleCategoryChange(cat, false)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Categories
            </h3>
            <CategoryList />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <MobileDrawer />
      <DesktopSidebar />
    </>
  );
}