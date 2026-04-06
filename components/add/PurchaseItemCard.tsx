"use client";
import { Category } from "@/app/types";

export interface PurchaseItem {
  item: string;
  category: string;
  purchaseAmount: string;
  taxes: string;
  notes: string;
}

export const TAX_OPTIONS = ["0%", "5%", "12%"];

export const EMPTY_PURCHASE: PurchaseItem = {
  item: "",
  category: "",
  purchaseAmount: "",
  taxes: "0%",
  notes: "",
};

interface PurchaseItemCardProps {
  purchase: PurchaseItem;
  index: number;
  categories: Category[];
  onChange: (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onRemove: (index: number) => void;
}

export default function PurchaseItemCard({
  purchase,
  index,
  categories,
  onChange,
  onRemove,
}: PurchaseItemCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
      {/* Card header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-paynes-gray">
          {purchase.item ? purchase.item : `Item ${index + 1}`}
        </span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Item Name */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-paynes-gray mb-1">
            Item Name
          </label>
          <input
            type="text"
            name="item"
            value={purchase.item}
            onChange={(e) => onChange(index, e)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
            placeholder="What did you buy?"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-paynes-gray mb-1">
            Category
          </label>
          <select
            name="category"
            value={purchase.category}
            onChange={(e) => onChange(index, e)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
          >
            <option disabled value="">
              Select a category
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>
</div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-paynes-gray mb-1">
            Amount ($)
          </label>
          <input
            type="number"
            name="purchaseAmount"
            value={purchase.purchaseAmount}
            onChange={(e) => onChange(index, e)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        {/* Tax Rate */}
        <div>
          <label className="block text-xs font-medium text-paynes-gray mb-1">
            Tax Rate
          </label>
          <select
            name="taxes"
            value={purchase.taxes}
            onChange={(e) => onChange(index, e)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
          >
            {TAX_OPTIONS.map((tax) => (
              <option key={tax} value={tax}>
                {tax}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-paynes-gray mb-1">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={purchase.notes}
            onChange={(e) => onChange(index, e)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
            placeholder="Any additional details..."
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}