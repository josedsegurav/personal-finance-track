"use client";

import { TransactionFilterState } from "@/lib/transactionFilters";
import { Store, Category } from "@/app/types";

interface TransactionFiltersPanelProps {
  filters: TransactionFilterState;
  onChange: (name: keyof TransactionFilterState, value: string) => void;
  stores: Store[];
  categories: Category[];
  months: string[];
  years: string[];
  showCategory: boolean;
}

export default function TransactionFiltersPanel({
  filters,
  onChange,
  stores,
  categories,
  months,
  years,
  showCategory,
}: TransactionFiltersPanelProps) {
  return (
    <div className="mb-4 lg:mb-6">
      {/* Mobile-first Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-paynes-gray mb-1 lg:hidden">
            Month
          </label>
          <select
            name="month"
            value={filters.month}
            onChange={(e) => onChange("month", e.target.value)}
            className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-columbia-blue bg-white"
          >
            <option value="all">All Months</option>
            {months.map((month, index) => (
              <option key={index} value={String(index)}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-paynes-gray mb-1 lg:hidden">
            Year
          </label>
          <select
            name="year"
            value={filters.year}
            onChange={(e) => onChange("year", e.target.value)}
            className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-columbia-blue bg-white"
          >
            <option value="all">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {showCategory && (
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-paynes-gray mb-1 lg:hidden">
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={(e) => onChange("category", e.target.value)}
              className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-columbia-blue bg-white"
            >
              <option value="all">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-paynes-gray mb-1 lg:hidden">
            Store
          </label>
          <select
            name="store"
            value={filters.store}
            onChange={(e) => onChange("store", e.target.value)}
            className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-columbia-blue bg-white"
          >
            <option value="all">All Stores</option>
            {stores?.map((store) => (
              <option key={store.id} value={String(store.id)}>
                {store.store_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search input */}
      <div className="w-full">
        <label className="block text-xs font-medium text-paynes-gray mb-1 lg:hidden">
          Search
        </label>
        <input
          type="text"
          name="search"
          placeholder="Search description, item, store, category…"
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-columbia-blue bg-white"
        />
      </div>
    </div>
  );
}