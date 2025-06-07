"use client";

import { useEffect, useState } from "react";
import Chart from "./chart";


export default function Transactions(props) {
  const { totalExpenses, totalNetIncome, income, expenses } = props;

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Create a new array that combines both income and expenses
    const incomeTransactions = income.map((eachIncome) => ({
      id: "income" + eachIncome.id,
      date: eachIncome.income_date,
      description: eachIncome.description,
      type: "income",
      amount: eachIncome.net_income
    }));

    const expenseTransactions = expenses.map((expense) => ({
      id: "expense" + expense.id,
      date: expense.expense_date,
      description: expense.description,
      type: "expense",
      amount: expense.total_expense
    }));

    const combinedTransactions = [...incomeTransactions, ...expenseTransactions];

    const sortedTransaction = combinedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-15).reverse();

    // Set transactions to the combined array
    setTransactions(sortedTransaction);
  }, [income, expenses]);

  return (
    <>

    {/* Mobile-first Chart */}
      <Chart
        totalExpenses={totalExpenses}
        totalNetIncome={totalNetIncome}
      />

  {/* Recent Transactions */}
  <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
    <h2 className="text-xl font-semibold text-paynes-gray mb-4">
      Recent Transactions
    </h2>

    {/* Transactions List */}
    <div className="space-y-3">
      {transactions.length === 0 ? (
        <div className="py-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-paynes-gray font-medium">No transactions found</span>
            <span className="text-sm text-paynes-gray opacity-70">
              Your recent transactions will appear here
            </span>
          </div>
        </div>
      ) : (
        transactions.map((transaction) => (
          <div key={transaction.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {transaction.type === "expense" ? (
                    <span className="bg-bittersweet bg-opacity-10 text-bittersweet rounded-full px-2 py-1 text-xs font-medium">
                      Expense
                    </span>
                  ) : (
                    <span className="bg-green-500 bg-opacity-10 text-green-500 rounded-full px-2 py-1 text-xs font-medium">
                      Income
                    </span>
                  )}
                  <span className="text-xs text-paynes-gray">
                    {transaction.date}
                  </span>
                  <h4 className="font-medium text-paynes-gray text-sm mb-1">
                  {transaction.description}
                </h4>
                </div>

              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <div className={`text-lg font-semibold ${transaction.type === "expense" ? "text-bittersweet" : "text-green-500"}`}>
                  {transaction.type === "expense" ? "-" : "+"}$
                  {transaction.amount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
</>
  );
}
