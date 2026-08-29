"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ExpenseDetailed, PurchaseDetailed, Category, Store } from "@/app/types";
import { TransactionFilterState } from "@/lib/transactionFilters";
import {
  filterExpenses,
  filterPurchases,
  groupPurchasesByExpenseId,
  buildGroupedExpenses,
} from "@/lib/transactionFilters";
import TransactionTabs from "./TransactionTabs";
import TransactionFiltersPanel from "./TransactionFiltersPanel";
import GroupedTransactionCard from "./GroupedTransactionCard";
import PurchaseCard from "./PurchaseCard";
import ExpensesChart from "@/components/expenses/chart";
import PurchasesChart from "@/components/purchases/chart";

interface TransactionsViewProps {
  expenses: ExpenseDetailed[];
  purchases: PurchaseDetailed[];
  categories: Category[];
  stores: Store[];
  initialTab: "all" | "expenses" | "purchases";
  initialFilters: TransactionFilterState;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getYears = () => {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear - 1, currentYear - 2].map(String);
};

export default function TransactionsView({
  expenses,
  purchases,
  categories,
  stores,
  initialTab,
  initialFilters,
}: TransactionsViewProps) {
  const router = useRouter();

  const [tab, setTab] = useState<"all" | "expenses" | "purchases">(initialTab);
  const [filters, setFilters] = useState<TransactionFilterState>(initialFilters);
  const [chartView, setChartView] = useState<"store" | "category">("store");

  const YEARS = getYears();

  const allPurchasesByExpenseId = useMemo(
    () => groupPurchasesByExpenseId(purchases),
    [purchases]
  );

  const filteredExpenses = useMemo(
    () => filterExpenses(expenses, filters),
    [expenses, filters]
  );

  const filteredPurchases = useMemo(
    () => filterPurchases(purchases, filters),
    [purchases, filters]
  );

  const groupedAll = useMemo(
    () => buildGroupedExpenses(filteredExpenses, allPurchasesByExpenseId, filters),
    [filteredExpenses, allPurchasesByExpenseId, filters]
  );

  const groupedExpensesOnly = useMemo(
    () =>
      buildGroupedExpenses(filteredExpenses, allPurchasesByExpenseId, {
        ...filters,
        category: "all",
      }),
    [filteredExpenses, allPurchasesByExpenseId, filters]
  );

  const syncUrl = useCallback((nextTab: "all" | "expenses" | "purchases", nextFilters: TransactionFilterState) => {
    const params = new URLSearchParams();
    params.set("tab", nextTab);
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        params.set(key, value);
      }
    });
    router.replace(`/home/transactions?${params.toString()}`, { scroll: false });
  }, [router]);

  const handleTabChange = (nextTab: "all" | "expenses" | "purchases") => {
    setTab(nextTab);
    syncUrl(nextTab, filters);
  };

  const handleFilterChange = (name: keyof TransactionFilterState, value: string) => {
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    if (name !== "search") {
      syncUrl(tab, nextFilters);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      syncUrl(tab, filters);
    }, 300);
    return () => clearTimeout(handler);
  }, [filters, tab, syncUrl]);

  const expenseTotalAmount = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [filteredExpenses]
  );
  const expenseTotalAfterTax = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + Number(e.total_expense), 0),
    [filteredExpenses]
  );
  const expenseTotalTax = expenseTotalAfterTax - expenseTotalAmount;

  const purchaseTotalAmount = useMemo(
    () => filteredPurchases.reduce((sum, p) => sum + Number(p.amount), 0),
    [filteredPurchases]
  );
  const purchaseTotalTax = useMemo(
    () =>
      filteredPurchases.reduce(
        (sum, p) => sum + Number(p.amount) * (Number(p.taxes) / 100),
        0
      ),
    [filteredPurchases]
  );
  const purchaseTotalAfterTax = purchaseTotalAmount + purchaseTotalTax;

  const renderCharts = () => {
    if (tab === "expenses") {
      return (
        <ExpensesChart
          filters={{
            month: Number(filters.month),
            year: Number(filters.year),
            store: filters.store,
          }}
          expenses={filteredExpenses}
          months={MONTHS}
        />
      );
    }
    if (tab === "purchases") {
      return (
        <PurchasesChart
          filters={{
            month: Number(filters.month),
            year: Number(filters.year),
            category: filters.category,
          }}
          purchases={filteredPurchases}
          months={MONTHS}
        />
      );
    }
    return (
      <div>
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              chartView === "store"
                ? "bg-glaucous text-white"
                : "bg-gray-100 text-paynes-gray hover:bg-gray-200"
            }`}
            onClick={() => setChartView("store")}
          >
            By Store
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              chartView === "category"
                ? "bg-glaucous text-white"
                : "bg-gray-100 text-paynes-gray hover:bg-gray-200"
            }`}
            onClick={() => setChartView("category")}
          >
            By Category
          </button>
        </div>
        {chartView === "store" ? (
          <ExpensesChart
            filters={{
              month: Number(filters.month),
              year: Number(filters.year),
              store: filters.store,
            }}
            expenses={filteredExpenses}
            months={MONTHS}
          />
        ) : (
          <PurchasesChart
            filters={{
              month: Number(filters.month),
              year: Number(filters.year),
              category: filters.category,
            }}
            purchases={filteredPurchases}
            months={MONTHS}
          />
        )}
      </div>
    );
  };

  const renderSummaryCards = () => {
    if (tab === "expenses") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">
              Total Expenses
            </h3>
            <p className="text-xl lg:text-2xl font-semibold text-bittersweet">
              ${expenseTotalAfterTax.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">
              Total Taxes
            </h3>
            <p className="text-xl lg:text-2xl font-semibold text-paynes-gray">
              ${expenseTotalTax.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">
              Pre-tax Amount
            </h3>
            <p className="text-xl lg:text-2xl font-semibold text-columbia-blue">
              ${expenseTotalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      );
    }
    if (tab === "purchases") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">
              Total Purchases
            </h3>
            <p className="text-xl lg:text-2xl font-semibold text-bittersweet">
              ${purchaseTotalAfterTax.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">
              Total Taxes
            </h3>
            <p className="text-xl lg:text-2xl font-semibold text-paynes-gray">
              ${purchaseTotalTax.toFixed(2)}
            </p>
          </div>
        </div>
      );
    }
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">
              Total Expenses
            </h3>
            <p className="text-xl lg:text-2xl font-semibold text-bittersweet">
              ${expenseTotalAfterTax.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">
              Purchase Items
            </h3>
            <p className="text-xl lg:text-2xl font-semibold text-columbia-blue">
              {filteredPurchases.length}
            </p>
          </div>
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">
              Categorized Amount
            </h3>
            <p className="text-xl lg:text-2xl font-semibold text-paynes-gray">
              ${purchaseTotalAfterTax.toFixed(2)}
            </p>
          </div>
        </div>
        <p className="text-xs text-paynes-gray opacity-60 mb-4 text-center">
          Purchases are line items within expenses, not additional charges.
        </p>
      </>
    );
  };

  const renderList = () => {
    if (tab === "all") {
      if (groupedAll.length === 0) {
        return (
          <div className="py-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-paynes-gray font-medium">No results found</span>
              <span className="text-sm text-paynes-gray opacity-70">
                Try adjusting your filters
              </span>
            </div>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {groupedAll.map((g) => (
            <GroupedTransactionCard
              key={g.expense.id}
              expense={g.expense}
              purchases={g.purchases}
              totalPurchaseCount={g.totalPurchaseCount}
              stores={stores}
              categories={categories}
            />
          ))}
        </div>
      );
    }
    if (tab === "expenses") {
      if (groupedExpensesOnly.length === 0) {
        return (
          <div className="py-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-paynes-gray font-medium">No results found</span>
              <span className="text-sm text-paynes-gray opacity-70">
                Try adjusting your filters
              </span>
            </div>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {groupedExpensesOnly.map((g) => (
            <GroupedTransactionCard
              key={g.expense.id}
              expense={g.expense}
              purchases={g.purchases}
              totalPurchaseCount={g.totalPurchaseCount}
              stores={stores}
              categories={categories}
            />
          ))}
        </div>
      );
    }
    if (filteredPurchases.length === 0) {
      return (
        <div className="py-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-paynes-gray font-medium">No results found</span>
            <span className="text-sm text-paynes-gray opacity-70">
              Try adjusting your filters
            </span>
          </div>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredPurchases.map((p) => (
          <PurchaseCard
            key={p.id}
            purchase={p}
            categories={categories}
            stores={stores}
            compact={false}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
      <TransactionTabs active={tab} onChange={handleTabChange} />
      {renderCharts()}
      <TransactionFiltersPanel
        filters={filters}
        onChange={handleFilterChange}
        stores={stores}
        categories={categories}
        months={MONTHS}
        years={YEARS}
        showCategory={tab !== "expenses"}
      />
      {renderSummaryCards()}
      <div className="mb-4 lg:mb-6">
        <h2 className="text-lg font-semibold text-paynes-gray mb-4">
          {tab === "all"
            ? "All Transactions"
            : tab === "expenses"
            ? "Expense Transactions"
            : "Purchase Transactions"}
        </h2>
        {renderList()}
      </div>
    </div>
  );
}