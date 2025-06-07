"use client";

import { useState } from "react";
import Chart from "./chart";
import EditTransaction from "../editTransaction";

export default function FiltersAndTransactions(props) {
  const {
    currentDate,
    categories,
    purchases,
    stores,
    currentMonthPurchases,
    currentMonthTaxes,
  } = props;

  const monthPurchases = purchases
    .filter(
      (purchase) =>
        new Date(purchase.expenses.expense_date).getFullYear() ===
        currentDate.getFullYear()
    )
    .filter(
      (purchase) =>
        new Date(purchase.expenses.expense_date).getUTCMonth() ===
        currentDate.getMonth()
    );

  const [filteredPurchases, setFilteredPurchases] = useState(monthPurchases);
  const [emptyFilter, setEmptyFilter] = useState(false);
  const [filters, setFilters] = useState({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth(),
    category: "all",
    store: "all",
  });
  const [totalPurchases, setTotalPurchases] = useState(currentMonthPurchases);
  const [totalTaxes, setTotalTaxes] = useState(currentMonthTaxes);

  const months = [
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

  const handleFilter = (e) => {
    const { name, value } = e.target;

    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    let result = purchases;

    if (newFilters.year != "all") {
      result = result.filter(
        (purchase) =>
          new Date(purchase.expenses.expense_date).getFullYear() ==
          newFilters.year
      );
    }

    if (newFilters.month != "all") {
      result = result.filter(
        (purchase) =>
          new Date(purchase.expenses.expense_date).getUTCMonth() ==
          newFilters.month
      );
    }

    if (newFilters.category != "all") {
      result = result.filter(
        (purchase) => purchase.categories.id == newFilters.category
      );
    }

    if (newFilters.store != "all") {
      result = result.filter(
        (purchase) => purchase.expenses.stores.id == newFilters.store
      );
    }

    setTotalPurchases(
      result.reduce((sum, purchase) => sum + parseFloat(purchase.amount), 0)
    );

    setTotalTaxes(
      result.reduce(
        (sum, purchase) =>
          sum + parseFloat(purchase.amount) * parseInt(purchase.taxes),
        0
      )
    );

    if (result.length === 0) {
      setEmptyFilter(true);
    } else {
      setEmptyFilter(false);

      setFilteredPurchases(result);
    }
  };

  console.log("Filtered Purchases:", filteredPurchases);

  return (
    <>
      <Chart
        filters={filters}
        purchases={filteredPurchases ?? []}
        months={months}
      />

      <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
        <div className="mb-4 lg:mb-6">
          <h2 className="text-lg font-semibold text-paynes-gray mb-4">
            Purchase Transactions
          </h2>

          {/* Mobile-first Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-medium text-paynes-gray mb-1 lg:hidden">
                Month
              </label>
              <select
                name="month"
                defaultValue={currentDate.getMonth()}
                onChange={handleFilter}
                className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-columbia-blue bg-white"
              >
                <option value="all">All Months</option>
                {months.map((month, index) => (
                  <option key={index} value={index}>
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
                onChange={handleFilter}
                defaultValue={currentDate.getFullYear()}
                className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-columbia-blue bg-white"
              >
                <option value="all">All Years</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>

            <div className="flex-1 min-w-0">
              <label className="block text-xs font-medium text-paynes-gray mb-1 lg:hidden">
                Category
              </label>
              <select
                name="category"
                onChange={handleFilter}
                defaultValue="all"
                className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-columbia-blue bg-white"
              >
                <option value="all">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-0">
              <label className="block text-xs font-medium text-paynes-gray mb-1 lg:hidden">
                Store
              </label>
              <select
                name="store"
                onChange={handleFilter}
                defaultValue="all"
                className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-columbia-blue bg-white"
              >
                <option value="all">All Stores</option>
                {stores?.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.store_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Unified Card Grid Display */}
        <div>
          {emptyFilter ? (
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
                <span className="text-paynes-gray font-medium">
                  No results found
                </span>
                <span className="text-sm text-paynes-gray opacity-70">
                  Try adjusting your filters
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Card */}
              <div className="bg-columbia-blue bg-opacity-10 p-4 lg:p-6 rounded-lg mb-4">
                <div className="flex flex-row justify-between gap-3">
                  <h3 className="text-lg font-semibold text-paynes-gray">
                    Total Summary
                  </h3>
                  <div className="flex justify-between gap-6 text-center sm:text-right">
                    <div>
                      <div className="text-sm text-paynes-gray mb-1">
                        Amount
                      </div>
                      <div className="font-semibold text-paynes-gray">
                        ${totalPurchases.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-paynes-gray mb-1">Tax</div>
                      <div className="font-semibold text-paynes-gray">
                        ${(totalTaxes / 100).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-paynes-gray mb-1">Total</div>
                      <div className="text-lg font-bold text-bittersweet">
                        ${(totalPurchases + totalTaxes / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Responsive Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredPurchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="bg-bittersweet bg-opacity-10 text-bittersweet rounded-full px-2 py-1 text-xs font-medium">
                            {purchase.categories.category_name}
                          </span>
                          <span className="bg-bittersweet bg-opacity-10 text-bittersweet rounded-full px-2 py-1 text-xs font-medium">
                            {purchase.expenses.stores.store_name}
                          </span>
                          <span className="text-xs text-paynes-gray">
                            {purchase.expenses.expense_date}
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
                          $
                          {(
                            purchase.amount +
                            (purchase.taxes / 100) * purchase.amount
                          ).toFixed(2)}
                        </div>
                        <div className="text-xs text-paynes-gray space-y-0.5">
                          <div>Amount: ${purchase.amount}</div>
                          <div>
                            Tax: $
                            {((purchase.taxes / 100) * purchase.amount).toFixed(
                              2
                            )}
                          </div>
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
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
