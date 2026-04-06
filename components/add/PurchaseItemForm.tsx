"use client";
import { useState } from "react";
import CategoryEdit from "@/components/add/categoriesEdit";
import { PurchaseItem, TAX_OPTIONS, EMPTY_PURCHASE } from "./PurchaseItemCard";
import { Category } from "@/app/types";

interface PurchaseItemFormProps {
  categories: Category[];
  onAdd: (item: PurchaseItem) => void;
  /** Pre-fills the form — used by the single-item shortcut in ExpenseForm */
  prefill?: Partial<PurchaseItem>;
}

export default function PurchaseItemForm({
  categories,
  onAdd,
  prefill,
}: PurchaseItemFormProps) {
  const [form, setForm] = useState<PurchaseItem>({
    ...EMPTY_PURCHASE,
    ...prefill,
  });
  const [open, setOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isComplete =
    form.item.trim() !== "" &&
    form.category !== "" &&
    form.purchaseAmount.trim() !== "";

  const handleAdd = () => {
    onAdd(form);
    setForm({ ...EMPTY_PURCHASE });
    setOpen(false);
  };

  return (
    <div className="border border-dashed border-gray-300 rounded-lg">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full py-3 text-sm font-medium text-glaucous hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Add another item
        </button>
      ) : (
        <div className="p-4">
          <h4 className="text-sm font-semibold text-paynes-gray mb-3">
            New Item
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Item Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-paynes-gray mb-1">
                Item Name
              </label>
              <input
                type="text"
                name="item"
                value={form.item}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                placeholder="What did you buy?"
                autoFocus
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-paynes-gray mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
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
              <CategoryEdit categories={categories} />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-paynes-gray mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                name="purchaseAmount"
                value={form.purchaseAmount}
                onChange={handleChange}
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
                value={form.taxes}
                onChange={handleChange}
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
                value={form.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                placeholder="Any additional details..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                setForm({ ...EMPTY_PURCHASE });
                setOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-paynes-gray hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isComplete}
              onClick={handleAdd}
              className="px-4 py-2 text-sm font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}