"use client";

import { PurchaseDetailed, Category, Store } from "@/app/types";
import { getPurchaseStore, getPurchaseCategory, getPurchaseExpense } from "@/lib/transactionFilters";
import EditTransaction from "@/components/editTransaction";

interface PurchaseCardProps {
  purchase: PurchaseDetailed;
  categories: Category[];
  stores: Store[];
  compact?: boolean;
}

export default function PurchaseCard({
  purchase,
  categories,
  stores,
  compact = false,
}: PurchaseCardProps) {
  const store = getPurchaseStore(purchase);
  const category = getPurchaseCategory(purchase);
  const total = Number(purchase.amount) + (Number(purchase.amount) * Number(purchase.taxes)) / 100;
  const taxAmount = (Number(purchase.amount) * Number(purchase.taxes)) / 100;

  if (compact) {
    return (
      <div className="bg-white p-3 rounded-lg border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-bittersweet bg-opacity-10 text-bittersweet rounded-full px-2 py-1 text-xs font-medium">
                {category?.category_name ?? "Uncategorized"}
              </span>
            </div>
            <div className="mb-1">
              <h4 className="font-medium text-paynes-gray text-sm">
                {purchase.item}
              </h4>
            </div>
            {purchase.notes && (
              <div className="text-xs text-paynes-gray bg-gray-100 p-2 rounded">
                {purchase.notes}
              </div>
            )}
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <div className="text-lg font-semibold text-bittersweet mb-1">
              ${total.toFixed(2)}
            </div>
            <div className="text-xs text-paynes-gray space-y-0.5">
              <div>Amount: ${Number(purchase.amount).toFixed(2)}</div>
              <div>Tax: ${taxAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-2 border-t border-gray-200">
          <EditTransaction
            table="purchase"
            purchase={purchase}
            categories={categories}
            stores={stores}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-bittersweet bg-opacity-10 text-bittersweet rounded-full px-2 py-1 text-xs font-medium">
              {category?.category_name ?? "Uncategorized"}
            </span>
            <span className="bg-bittersweet bg-opacity-10 text-bittersweet rounded-full px-2 py-1 text-xs font-medium">
              {store?.store_name ?? "Unknown store"}
            </span>
            <span className="text-xs text-paynes-gray">
              {String(getPurchaseExpense(purchase)?.expense_date ?? "")}
            </span>
          </div>
          <div className="mb-2">
            <h4 className="font-medium text-paynes-gray text-sm">
              {purchase.item}
            </h4>
          </div>
          {purchase.notes && (
            <div className="text-xs text-paynes-gray bg-gray-100 p-2 rounded">
              {purchase.notes}
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-lg font-semibold text-bittersweet mb-1">
            ${total.toFixed(2)}
          </div>
          <div className="text-xs text-paynes-gray space-y-0.5">
            <div>Amount: ${Number(purchase.amount).toFixed(2)}</div>
            <div>Tax: ${taxAmount.toFixed(2)}</div>
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-2 border-t border-gray-200">
        <EditTransaction
          table="purchase"
          purchase={purchase}
          categories={categories}
          stores={stores}
        />
      </div>
    </div>
  );
}