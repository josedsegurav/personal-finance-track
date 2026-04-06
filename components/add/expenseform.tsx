"use client";
import { createClient } from "@/utils/supabase/client";
import { useState, useMemo } from "react";
import StoresEdit from "@/components/add/storesEdit";
import CategoryEdit from "@/components/add/categoriesEdit";
import ImageInvoiceUpload from "@/components/add/ImageInvoiceUpload";
import PurchaseItemCard, {
  PurchaseItem,
  TAX_OPTIONS,
  EMPTY_PURCHASE,
} from "@/components/add/PurchaseItemCard";
import PurchaseItemForm from "@/components/add/PurchaseItemForm";
import { Category, Store } from "@/app/types";

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface FormExpenseData {
  description: string;
  payment_method: string;
  store: string;
  amount: string;
  total_expense: string;
  date: string;
}

export interface ExtractedData {
  expense: FormExpenseData;
  purchases: Array<PurchaseItem>;
}

const EMPTY_EXPENSE: FormExpenseData = {
  description: "",
  payment_method: "",
  store: "",
  amount: "",
  total_expense: "",
  date: new Date().toISOString().split("T")[0],
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/** Parse "5%" → 0.05 */
function taxRate(taxStr: string): number {
  return parseFloat(taxStr.replace("%", "")) / 100;
}

/** Sum pre-tax amounts from the items list */
function calcPreTaxTotal(items: PurchaseItem[]): string {
  const total = items.reduce(
    (acc, p) => acc + (parseFloat(p.purchaseAmount) || 0),
    0
  );
  return total > 0 ? total.toFixed(2) : "";
}

/** Sum post-tax amounts from the items list */
function calcPostTaxTotal(items: PurchaseItem[]): string {
  const total = items.reduce((acc, p) => {
    const amt = parseFloat(p.purchaseAmount) || 0;
    return acc + amt * (1 + taxRate(p.taxes));
  }, 0);
  return total > 0 ? total.toFixed(2) : "";
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function ExpenseForm({
  stores,
  categories,
}: {
  stores: Store[];
  categories: Category[];
}) {
  const supabase = createClient();

  /* Expense header fields */
  const [expense, setExpense] = useState<FormExpenseData>(EMPTY_EXPENSE);

  /* Items list */
  const [items, setItems] = useState<PurchaseItem[]>([]);

  /* Single-item mode */
  const [singleItem, setSingleItem] = useState(false);
  const [singleItemData, setSingleItemData] = useState<PurchaseItem>({
    ...EMPTY_PURCHASE,
  });

  /* UI state */
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  /* ── Derived ── */
  const isExpenseComplete = useMemo(
    () => Object.values(expense).every((v) => v.trim() !== ""),
    [expense]
  );

  const isSingleItemComplete = useMemo(
    () =>
      singleItemData.item.trim() !== "" &&
      singleItemData.category !== "" &&
      singleItemData.purchaseAmount.trim() !== "",
    [singleItemData]
  );

  const canSubmit = useMemo(() => {
    if (!isExpenseComplete) return false;
    if (singleItem) return isSingleItemComplete;
    return items.length > 0;
  }, [isExpenseComplete, singleItem, isSingleItemComplete, items]);

  /* ── Handlers ── */

  const handleExpenseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleSingleItemChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSingleItemData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [name]: value } : item))
    );
  };

  const handleAddItem = (newItem: PurchaseItem) => {
    setItems((prev) => [...prev, newItem]);
    // Auto-update totals
    const updated = [...items, newItem];
    setExpense((prev) => ({
      ...prev,
      amount: calcPreTaxTotal(updated),
      total_expense: calcPostTaxTotal(updated),
    }));
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    setExpense((prev) => ({
      ...prev,
      amount: calcPreTaxTotal(updated),
      total_expense: calcPostTaxTotal(updated),
    }));
  };

  /* When single-item amount changes, propagate to expense totals */
  const handleSingleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    handleSingleItemChange(e);
    const amt = parseFloat(e.target.value) || 0;
    const rate = taxRate(singleItemData.taxes);
    setExpense((prev) => ({
      ...prev,
      amount: amt > 0 ? amt.toFixed(2) : "",
      total_expense: amt > 0 ? (amt * (1 + rate)).toFixed(2) : "",
    }));
  };

  const handleSingleTaxChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    handleSingleItemChange(e);
    const amt = parseFloat(singleItemData.purchaseAmount) || 0;
    const rate = taxRate(e.target.value);
    setExpense((prev) => ({
      ...prev,
      total_expense: amt > 0 ? (amt * (1 + rate)).toFixed(2) : "",
    }));
  };

  /* Toggle single-item mode */
  const handleSingleItemToggle = (checked: boolean) => {
    setSingleItem(checked);
    if (checked) {
      // Pre-fill item name from description and amount from expense amount
      setSingleItemData((prev) => ({
        ...prev,
        item: expense.description || prev.item,
        purchaseAmount: expense.amount || prev.purchaseAmount,
      }));
      setItems([]);
    } else {
      setSingleItemData({ ...EMPTY_PURCHASE });
    }
  };

  /* AI invoice extraction */
  const handleAIDataExtraction = (extractedData: ExtractedData) => {
    const matchedStore = stores.find(
      (s) =>
        s.store_name.toLowerCase().includes(extractedData.expense.store.toLowerCase()) ||
        extractedData.expense.store.toLowerCase().includes(s.store_name.toLowerCase())
    );

    setExpense({
      ...extractedData.expense,
      store: matchedStore ? matchedStore.id.toString() : "",
    });

    const mappedPurchases = extractedData.purchases.map((p) => {
      const matchedCat = categories.find(
        (c) =>
          c.category_name.toLowerCase().includes(p.category.toLowerCase()) ||
          p.category.toLowerCase().includes(c.category_name.toLowerCase())
      );
      return { ...p, category: matchedCat ? matchedCat.id.toString() : "" };
    });

    setItems(mappedPurchases);

    if (mappedPurchases.length === 1) {
      setSingleItem(true);
      setSingleItemData(mappedPurchases[0]);
      setItems([]);
    } else {
      setSingleItem(false);
    }

    setStatusMessage(
      `Extracted ${extractedData.purchases.length} item(s) from invoice.`
    );
    setStatus("success");
    setTimeout(() => setStatus("idle"), 4000);
  };

  /* Submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const { data, error } = await supabase
        .from("expenses")
        .insert([
          {
            description: expense.description,
            store_id: parseInt(expense.store),
            amount: parseFloat(expense.amount),
            total_expense: parseFloat(expense.total_expense),
            payment_method: expense.payment_method,
            expense_date: expense.date,
          },
        ])
        .select();

      if (error) throw error;

      const expenseId = data[0].id;
      const purchasesToInsert = singleItem ? [singleItemData] : items;

      await Promise.all(
        purchasesToInsert.map((p) =>
          supabase.from("purchases").insert([
            {
              item: p.item,
              category_id: parseInt(p.category),
              amount: parseFloat(p.purchaseAmount),
              taxes: parseFloat(p.taxes.replace("%", "")),
              notes: p.notes,
              expense_id: expenseId,
            },
          ])
        )
      );

      // Reset
      setExpense(EMPTY_EXPENSE);
      setItems([]);
      setSingleItem(false);
      setSingleItemData({ ...EMPTY_PURCHASE });
      setStatus("success");
      setStatusMessage("Expense added successfully!");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      console.error("Error submitting expense:", err);
      setStatus("error");
      setStatusMessage("Failed to add expense. Please try again.");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  /* ── Render ── */
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
      {/* AI Invoice Upload */}
      <ImageInvoiceUpload onDataExtracted={handleAIDataExtraction} />

      {/* Status banner */}
      {status === "success" && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
          {statusMessage}
        </div>
      )}
      {status === "error" && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Expense header ── */}
        <div>
          <h3 className="text-base font-semibold text-paynes-gray mb-4">
            Expense Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-paynes-gray mb-2">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={expense.description}
                onChange={handleExpenseChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                placeholder="A general description of the expense"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-paynes-gray mb-2">
                Date of Expense
              </label>
              <input
                type="date"
                name="date"
                value={expense.date}
                onChange={handleExpenseChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                required
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-paynes-gray mb-2">
                Payment Method
              </label>
              <select
                name="payment_method"
                value={expense.payment_method}
                onChange={handleExpenseChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
              >
                <option disabled value="">
                  Select a payment method
                </option>
                <option value="credit card">Credit Card</option>
                <option value="debit card">Debit Card</option>
                <option value="cash">Cash</option>
                <option value="bank transfer">Bank Transfer</option>
              </select>
            </div>

            {/* Store */}
            <div>
              <label className="block text-sm font-medium text-paynes-gray mb-2">
                Store
              </label>
              <select
                name="store"
                value={expense.store}
                onChange={handleExpenseChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                required
              >
                <option value="">Select a store</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.store_name}
                  </option>
                ))}
              </select>
              <StoresEdit stores={stores} />
            </div>

            {/* Amount before taxes */}
            <div>
              <label className="block text-sm font-medium text-paynes-gray mb-2">
                Amount before taxes ($)
              </label>
              <input
                type="number"
                name="amount"
                value={expense.amount}
                onChange={handleExpenseChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Total Expense */}
            <div>
              <label className="block text-sm font-medium text-paynes-gray mb-2">
                Total Expense ($)
              </label>
              <input
                type="number"
                name="total_expense"
                value={expense.total_expense}
                onChange={handleExpenseChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
        </div>

        {/* ── Items section ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-paynes-gray">
              Items Purchased
            </h3>
            {/* Single-item toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={singleItem}
                onChange={(e) => handleSingleItemToggle(e.target.checked)}
                className="w-4 h-4 accent-glaucous"
              />
              <span className="text-sm text-paynes-gray">Single item</span>
            </label>
          </div>

          {singleItem ? (
            /* ── Single-item inline fields ── */
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Item Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-paynes-gray mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="item"
                    value={singleItemData.item}
                    onChange={handleSingleItemChange}
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
                    value={singleItemData.category}
                    onChange={handleSingleItemChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                  >
                    <option disabled value="">
                      Select a category
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.category_name}
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
                    value={singleItemData.purchaseAmount}
                    onChange={handleSingleAmountChange}
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
                    value={singleItemData.taxes}
                    onChange={handleSingleTaxChange}
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
                    value={singleItemData.notes}
                    onChange={handleSingleItemChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    placeholder="Any additional details..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ── Multi-item list ── */
            <div className="space-y-3">
              {items.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No items added yet. Use the button below or enable{" "}
                  <strong>Single item</strong> mode.
                </p>
              )}

              {items.map((purchase, index) => (
                <PurchaseItemCard
                  key={index}
                  purchase={purchase}
                  index={index}
                  categories={categories}
                  onChange={handleItemChange}
                  onRemove={handleRemoveItem}
                />
              ))}

              <PurchaseItemForm categories={categories} onAdd={handleAddItem} />
            </div>
          )}
        </div>

        {/* ── Submit ── */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!canSubmit || status === "loading"}
            className="px-6 py-2 bg-glaucous text-white font-medium rounded-lg hover:bg-glaucous-dark transition-colors focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-opacity-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Saving…" : "Add Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}