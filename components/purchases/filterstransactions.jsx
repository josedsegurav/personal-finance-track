"use client";

import { useState } from "react";

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
    .filter((purchase) => {
      new Date(purchase.purchase_date).getFullYear() ===
        currentDate.getFullYear();
    })
    .filter((purchase) => {
      new Date(purchase.purchase_date).getMonth() === currentDate.getMonth();
    });

  const [filteredPurchases, setFilteredPurchases] = useState(monthPurchases);
  const [emptyFilter, setEmptyFilter] = useState(false);
  const [filters, setFilters] = useState({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth(),
    category: "all",
    store: "all",
  });
  const [totalPurchases, setTotalPurchases] = useState(currentMonthPurchases);
  const [totalTaxes, setTotolTaxes] = useState(currentMonthTaxes);

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
          new Date(purchase.purchase_date).getFullYear() == newFilters.year
      );
    }

    if (newFilters.month != "all") {
      result = result.filter(
        (purchase) =>
          new Date(purchase.purchase_date).getMonth() == newFilters.month
      );
    }

    if (newFilters.category != "all") {
      result = result.filter(
        (purchase) => purchase.categories.id == newFilters.category
      );
    }

    if (newFilters.store != "all") {
      result = result.filter(
        (purchase) => purchase.stores.id == newFilters.store
      );
    }

    setTotalPurchases(
      result.reduce((sum, purchase) => sum + parseFloat(purchase.amount), 0)
    );

    setTotolTaxes(
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


  return (
    <>
      {/* Filters and Transactions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-paynes-gray">
            purchase Transactions
          </h2>

          <div className="flex space-x-4 mt-4 sm:mt-0">
            <div>
              <select
                name="month"
                defaultValue={currentDate.getMonth()}
                onChange={handleFilter}
                className="py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-columbia-blue"
              >
                <option value="all">All Months</option>
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                name="year"
                onChange={handleFilter}
                defaultValue={currentDate.getFullYear()}
                className="py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-columbia-blue"
              >
                <option value="all">All Years</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>

            <div>
              <select
                name="category"
                onChange={handleFilter}
                defaultValue="all"
                className="py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-columbia-blue"
              >
                <option value="all">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                name="store"
                onChange={handleFilter}
                defaultValue="all"
                className="py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-columbia-blue"
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

        {/* Purchases Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-columbia-blue bg-opacity-30">
              <tr>
                <th className="text-left py-4 px-6 text-paynes-gray font-medium">
                  Date
                </th>
                <th className="text-left py-4 px-6 text-paynes-gray font-medium">
                  Description
                </th>
                <th className="text-left py-4 px-6 text-paynes-gray font-medium">
                  Category
                </th>
                <th className="text-left py-4 px-6 text-paynes-gray font-medium">
                  Store
                </th>
                <th className="text-right py-4 px-6 text-paynes-gray font-medium">
                  Amount
                </th>
                <th className="text-right py-4 px-6 text-paynes-gray font-medium">
                  Tax
                </th>
                <th className="text-right py-4 px-6 text-paynes-gray font-medium">
                  Total
                </th>
                <th className="text-right py-4 px-6 text-paynes-gray font-medium">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {emptyFilter ? (
                <tr className="border-b border-gray-100">
                  <td
                    colSpan="5"
                    className="py-8 px-6 text-center text-paynes-gray font-medium"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <span>Sorry, no results found</span>
                      <span className="text-sm opacity-70">
                        Try adjusting your filters
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-gray-100">
                    <td className="py-4 px-6 text-paynes-gray">
                      {purchase.purchase_date}
                    </td>
                    <td className="py-4 px-6 text-paynes-gray">
                      {purchase.item}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-bittersweet bg-opacity-10 text-bittersweet rounded-full px-3 py-1 text-xs font-medium">
                        {purchase.categories.category_name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-bittersweet bg-opacity-10 text-bittersweet rounded-full px-3 py-1 text-xs font-medium">
                        {purchase.stores.store_name}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-paynes-gray">
                      ${purchase.amount}
                    </td>
                    <td className="py-4 px-6 text-right text-paynes-gray">
                      ${(purchase.taxes * purchase.amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-bittersweet">
                      $
                      {(
                        purchase.amount +
                        purchase.taxes * purchase.amount
                      ).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right text-paynes-gray">
                      {purchase.notes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td
                  colSpan={4}
                  className="py-4 px-6 font-medium text-paynes-gray"
                >
                  Total
                </td>
                <td className="py-4 px-6 text-right font-medium text-paynes-gray">
                  ${totalPurchases.toFixed(2)}
                </td>
                <td className="py-4 px-6 text-right font-medium text-paynes-gray">
                  ${totalTaxes.toFixed(2)}
                </td>
                <td className="py-4 px-6 text-right font-medium text-bittersweet">
                  ${(totalPurchases + totalTaxes).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
