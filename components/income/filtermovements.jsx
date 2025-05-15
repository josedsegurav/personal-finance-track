"use client";

import { useState } from "react";

export default function FiltersAndMovements(props) {
  const {
    currentMonth,
    currentDate,
    income,
    currentMonthNetIncome,
    currentMonthGrossIncome,
    currentMonthTaxes,
  } = props;

  const monthNetIncome = income
    .filter(
      (eachIncome) =>
        new Date(eachIncome.income_date).getFullYear() ==
        currentDate.getFullYear()
    )
    .filter(
      (eachIncome) =>
        new Date(eachIncome.income_date).getMonth() == currentDate.getMonth()
    );

  const [emptyFilter, setEmptyFilter] = useState(false);
  const [filteredIncome, setFilteredIncome] = useState(monthNetIncome);
  const [totalGrossIncome, setTotalGrossIncome] = useState(
    currentMonthGrossIncome
  );
  const [totalNetIncome, setTotalNetIncome] = useState(currentMonthNetIncome);
  const [totalTaxes, setTotalTaxes] = useState(currentMonthTaxes);
  const [filters, setFilters] = useState({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth(),
  });

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

    let result = income;

    if (newFilters.year != "all") {
      result = result.filter(
        (eachIncome) =>
          new Date(eachIncome.income_date).getFullYear() == newFilters.year
      );
    }

    if (newFilters.month != "all") {
      result = result.filter(
        (eachIncome) =>
          new Date(eachIncome.income_date).getMonth() == newFilters.month
      );
    }
    setTotalGrossIncome(
      result.reduce((sum, eachIncome) => sum + eachIncome.gross_income, 0)
    );
    setTotalNetIncome(
      result.reduce((sum, eachIncome) => sum + eachIncome.net_income, 0)
    );

    setTotalTaxes(
      result.reduce(
        (sum, eachIncome) =>
          sum + eachIncome.gross_income - eachIncome.net_income,
        0
      )
    );
    if (result.length === 0) {
      setEmptyFilter(true);
    } else {
      setEmptyFilter(false);

      setFilteredIncome(result);
    }
  };

  return (
    <>
      {/* Filters and Transactions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-paynes-gray">
            Income Movements
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
          </div>
        </div>

        {/* Income Table */}
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
                  Gross Income
                </th>
                <th className="text-right py-4 px-6 text-paynes-gray font-medium">
                  Tax
                </th>
                <th className="text-left py-4 px-6 text-paynes-gray font-medium">
                  Net Income
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
                filteredIncome.map((income) => (
                  <tr key={income.id} className="border-b border-gray-100">
                    <td className="py-4 px-6 text-paynes-gray">
                      {income.income_date}
                    </td>
                    <td className="py-4 px-6 text-paynes-gray">
                      {income.description}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-bittersweet bg-opacity-10 text-bittersweet rounded-full px-3 py-1 text-xs font-medium">
                        ${parseFloat(income.gross_income)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-bittersweet bg-opacity-10 text-bittersweet rounded-full px-3 py-1 text-xs font-medium">
                        $
                        {(
                          parseFloat(income.gross_income) -
                          parseFloat(income.net_income)
                        ).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-paynes-gray">
                      ${parseFloat(income.net_income)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td
                  colSpan={2}
                  className="py-4 px-6 font-medium text-paynes-gray"
                >
                  Total
                </td>
                <td className="py-4 px-6 text-right font-medium text-paynes-gray">
                  ${totalGrossIncome.toFixed(2)}
                </td>
                <td className="py-4 px-6 text-right font-medium text-paynes-gray">
                  ${totalTaxes.toFixed(2)}
                </td>
                <td className="py-4 px-6 text-right font-medium text-bittersweet">
                  ${totalNetIncome.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
