"use client";

import { ExpenseDetailed, PurchaseDetailed, Store, Category } from "@/app/types";
import PurchaseCard from "./PurchaseCard";
import EditTransaction from "@/components/editTransaction";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface GroupedTransactionCardProps {
  expense: ExpenseDetailed;
  purchases: PurchaseDetailed[];
  totalPurchaseCount: number;
  stores: Store[];
  categories: Category[];
}

export default function GroupedTransactionCard({
  expense,
  purchases,
  totalPurchaseCount,
  stores,
  categories,
}: GroupedTransactionCardProps) {
  const storeName = (() => {
    const v: unknown = expense.stores;
    return Array.isArray(v) ? (v[0] as { store_name: string })?.store_name : (v as { store_name: string })?.store_name;
  })();

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-bittersweet bg-opacity-10 text-bittersweet rounded-full px-2 py-1 text-xs font-medium">
              {storeName}
            </span>
            <span className="text-xs text-paynes-gray">{expense.expense_date}</span>
          </div>
          <div className="mb-2">
            {totalPurchaseCount === 0 ? (
              <span className="font-medium text-paynes-gray">{expense.description}</span>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <span className="font-medium text-paynes-gray cursor-pointer hover:underline">
                    {expense.description}
                  </span>
                </DialogTrigger>
                <DialogContent className="overflow-y-scroll max-h-screen">
                  <DialogHeader>
                    <DialogTitle>Purchases</DialogTitle>
                    <DialogDescription>
                      {purchases.length === totalPurchaseCount
                        ? `All ${totalPurchaseCount} purchases for ${expense.description}`
                        : `${purchases.length} of ${totalPurchaseCount} purchases for ${expense.description}`}
                      {purchases.length !== totalPurchaseCount && (
                        <span className="block text-xs opacity-70 mt-1">Filtered by category/search</span>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    {purchases.length === 0 ? (
                      <p className="text-sm text-paynes-gray opacity-60">No purchases match the current filters.</p>
                    ) : (
                      purchases.map((purchase) => (
                        <PurchaseCard
                          key={purchase.id}
                          purchase={purchase}
                          categories={categories}
                          stores={stores}
                          compact={true}
                        />
                      ))
                    )}
                  </div>
                  <DialogClose className="px-6 py-2 bg-glaucous text-white font-medium rounded-lg hover:bg-glaucous-dark transition-colors focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-opacity-50">
                    Close
                  </DialogClose>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="text-xs text-paynes-gray">{expense.payment_method}</div>
          {totalPurchaseCount > 0 && (
            <div className="text-xs text-paynes-gray opacity-60 mt-1">
              {purchases.length} of {totalPurchaseCount} items — click description to view
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-lg font-semibold text-bittersweet mb-1">${expense.total_expense.toFixed(2)}</div>
          <div className="text-xs text-paynes-gray space-y-0.5">
            <div>Amount: ${Number(expense.amount).toFixed(2)}</div>
            <div>Tax: ${(Number(expense.total_expense) - Number(expense.amount)).toFixed(2)}</div>
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-2 border-t border-gray-200">
        <EditTransaction table="expense" expense={expense} stores={stores} />
      </div>
    </div>
  );
}
