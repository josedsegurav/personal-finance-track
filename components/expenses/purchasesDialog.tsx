"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../ui/dialog";
import { Collapsible } from "@radix-ui/react-collapsible";
import { CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  DollarSign,
  Tag,
  FileText,
  Calculator,
} from "lucide-react";

export default function PurchasesDialog(props: any) {
  const supabase = createClient();
  const [loading, setLoading] = useState({
    purchases: true,
  });
  const [error, setError] = useState<string | null>(null);

  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading((prev) => ({ ...prev, purchases: true }));
        const { data: purchases, error } = await supabase
          .from("purchases")
          .select(
            `id,
            created_at,
            item,
            categories (id, category_name),
            amount,
            taxes,
            notes`
          )
          .eq("expense_id", props.expense.id);

        if (error) throw error;

        setPurchases(purchases);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      } finally {
        setLoading((prev) => ({ ...prev, purchases: false }));
      }
    };

    fetchPurchases();
  }, [supabase]);
  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-4 py-2 bg-gray-200 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading.purchases) {
    return (
      <div className="p-4">
        Loading data...
        {/* You can add a spinner here */}
      </div>
    );
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="cursor-pointer">{props.expense.description}</span>
      </DialogTrigger>
      <DialogContent className="overflow-y-scroll max-h-screen">
        <DialogHeader>
          <DialogTitle>Purchases</DialogTitle>
          <DialogDescription>
            Purchases related to {props.expense.description}.
          </DialogDescription>
        </DialogHeader>
        {purchases ? (
          purchases.map((purchase: any) => (
            <Collapsible
              key={purchase.id}
              className="border border-gray-200 rounded-lg mb-3 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <CollapsibleTrigger className="w-full p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {purchase.item}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {purchase.categories.category_name}
                        </span>
                        <span className="text-sm text-gray-600">
                          ${purchase.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="bg-gray-50 border-t border-gray-200">
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Category:
                      </span>
                      <span className="text-sm text-gray-900">
                        {purchase.categories.category_name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Amount:
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        ${purchase.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calculator className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Taxes:
                      </span>
                      <span className="text-sm text-gray-900">
                        {purchase.taxes}%
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Total:
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        $
                        {(
                          purchase.amount +
                          (purchase.taxes / 100) * purchase.amount
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {purchase.notes && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Notes:
                          </span>
                          <p className="text-sm text-gray-900 mt-1">
                            {purchase.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        ) : (
          <p>No purchases found for this expense.</p>
        )}
        <DialogClose className="px-6 py-2 bg-glaucous text-white font-medium rounded-lg hover:bg-glaucous-dark transition-colors focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-opacity-50">

            Close

        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
