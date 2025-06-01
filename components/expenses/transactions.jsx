"use client";

import { useState } from "react";

export default function Transactions(props) {
  const {
    currentDate,
    expenses,
    stores,
    currentMonthexpenses,
    currentMonthExpensesAfterTax,
    currentMonthTaxes,
  } = props;
console.log(expenses)
  const monthexpenses = expenses
    .filter((expense) =>
      new Date(expense.expense_date).getFullYear() ==
        currentDate.getFullYear()
    )
    .filter((expense) =>
      new Date(expense.expense_date).getMonth() === currentDate.getMonth()
    );

  const [filteredexpenses, setFilteredexpenses] = useState(monthexpenses);
  const [emptyFilter, setEmptyFilter] = useState(false);
  const [filters, setFilters] = useState({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth(),
    category: "all",
    store: "all",
  });
  const [totalexpenses, setTotalexpenses] = useState(currentMonthexpenses);
  const [totalExpensesAfterTax, setTotalExpensesAfterTax] = useState(
    currentMonthExpensesAfterTax
  );


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

    let result = expenses;

    if (newFilters.year != "all") {
      result = result.filter(
        (expense) =>
          new Date(expense.expense_date).getFullYear() == newFilters.year
      );
    }

    if (newFilters.month != "all") {
      result = result.filter(
        (expense) =>
          new Date(expense.expense_date).getMonth() == newFilters.month
      );
    }

    if (newFilters.store != "all") {
      result = result.filter(
        (expense) => expense.stores.id == newFilters.store
      );
    }

    setTotalexpenses(
      result.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)
    );

    setTotalExpensesAfterTax(
      result.reduce(
        (sum, expense) => sum + parseFloat(expense.total_expense),
        0
      )
    );

    if (result.length === 0) {
      setEmptyFilter(true);
    } else {
      setEmptyFilter(false);

      setFilteredexpenses(result);
    }
  };

  console.log("Filtered Expenses: ", filteredexpenses);

  return (
    <>
      {/* Filters and Transactions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-paynes-gray">
            Expense Transactions
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

        {/* expenses Table */}
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
                  Payment Method
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
                filteredexpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100">
                    <td className="py-4 px-6 text-paynes-gray">
                      {expense.expense_date}
                    </td>
                    <td className="py-4 px-6 text-paynes-gray">
                      {expense.description}
                    </td>
                    <td className="py-4 px-6 text-paynes-gray">

                        {expense.payment_method}

                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-bittersweet bg-opacity-10 text-bittersweet rounded-full px-3 py-1 text-xs font-medium">
                        {expense.stores.store_name}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-paynes-gray">
                      ${expense.amount}
                    </td>
                    <td className="py-4 px-6 text-right text-paynes-gray">
                      ${(expense.total_expense - expense.amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-bittersweet">
                      ${expense.total_expense.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right text-paynes-gray">
                      {expense.notes}
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
                  ${totalexpenses.toFixed(2)}
                </td>
                <td className="py-4 px-6 text-right font-medium text-paynes-gray">
                  ${(totalExpensesAfterTax - totalexpenses).toFixed(2)}
                </td>
                <td className="py-4 px-6 text-right font-medium text-bittersweet">
                  ${(totalExpensesAfterTax).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
