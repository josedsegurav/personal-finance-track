"use client";

import { useState } from "react";
import EditTransaction from "../editTransaction";
import Chart from "./chart";

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
        new Date(eachIncome.income_date).getUTCMonth() == currentDate.getMonth()
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
          new Date(eachIncome.income_date).getUTCMonth() == newFilters.month
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
<Chart
    filters={filters}
    income={filteredIncome ?? []}
    months={months}
  />

  {/* Filters and Transactions */}
  <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
    <div className="mb-4 lg:mb-6">
      <h2 className="text-lg font-semibold text-paynes-gray mb-4">
        Income Movements
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
      </div>
    </div>

    {/* Unified Card Grid Display */}
    <div>
      {emptyFilter ? (
        <div className="py-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <span className="text-paynes-gray font-medium">No results found</span>
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
              <h3 className="text-lg font-semibold text-paynes-gray">Total Summary</h3>
              <div className="flex justify-between gap-6 text-center sm:text-right">
                <div>
                  <div className="text-sm text-paynes-gray mb-1">Gross</div>
                  <div className="font-semibold text-paynes-gray">
                    ${totalGrossIncome.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-paynes-gray mb-1">Tax</div>
                  <div className="font-semibold text-paynes-gray">
                    ${totalTaxes.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-paynes-gray mb-1">Net</div>
                  <div className="text-lg font-bold text-columbia-blue">
                    ${totalNetIncome.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Responsive Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {filteredIncome.map((income) => (
              <div key={income.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="bg-columbia-blue bg-opacity-10 text-columbia-blue rounded-full px-2 py-1 text-xs font-medium">
                        Income
                      </span>
                      <span className="text-xs text-paynes-gray">
                        {income.income_date}
                      </span>
                    </div>
                    <div className="mb-2">
                      <h3 className="font-medium text-paynes-gray text-sm line-clamp-2">
                        {income.description}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-lg font-semibold text-columbia-blue mb-1">
                      ${parseFloat(income.net_income).toFixed(2)}
                    </div>
                    <div className="text-xs text-paynes-gray space-y-0.5">
                      <div>Gross: ${parseFloat(income.gross_income).toFixed(2)}</div>
                      <div>Tax: ${(parseFloat(income.gross_income) - parseFloat(income.net_income)).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2 border-t border-gray-200">
                  <EditTransaction
                    table="income"
                    income={income}
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
