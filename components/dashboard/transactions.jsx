"use client";

import { useEffect, useState } from "react";


export default function Transactions(props) {
  const { income, expenses } = props;

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
      <tbody>
        {transactions.map((transaction) => (
          <tr key={transaction.id} className="border-b border-gray-100">
            <td className="py-4 px-6 text-paynes-gray">{transaction.date}</td>
            <td className="py-4 px-6 text-paynes-gray">
              {transaction.description}
            </td>
            <td className="py-4 px-6">
              {transaction.type === "expense" ? (
                <span className="bg-ghost-white text-bittersweet bg-opacity-10 rounded-full px-3 py-1 text-xs font-medium">
                  expense
                </span>
              ) : (
                <span className="bg-ghost-white bg-opacity-10 text-green-500 rounded-full px-3 py-1 text-xs font-medium">
                  Income
                </span>
              )}
            </td>
            <td
              className={`py-4 px-6 font-medium ${transaction.type === "expense" ? "text-bittersweet" : "text-green-500"}`}
            >
              {transaction.type === "expense" ? "-" : "+"}$
              {transaction.amount.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );
}
