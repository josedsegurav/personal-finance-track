"use client";

import { useEffect, useState } from "react";


export default function Transactions(props) {
  const { income, purchases } = props;

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Create a new array that combines both income and purchases
    const incomeTransactions = income.map((eachIncome) => ({
      id: "income" + eachIncome.id,
      date: eachIncome.income_date,
      description: eachIncome.description,
      type: "income",
      amount: eachIncome.net_income
    }));

    const purchaseTransactions = purchases.map((purchase) => ({
      id: "purchase" + purchase.id,
      date: purchase.purchase_date,
      description: purchase.item,
      type: "purchase",
      amount: purchase.amount
    }));

    const combinedTransactions = [...incomeTransactions, ...purchaseTransactions];

    const sortedTransaction = combinedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-15)

    // Set transactions to the combined array
    setTransactions(sortedTransaction);
  }, [income, purchases]);

  console.log(transactions);
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
              {transaction.type === "purchase" ? (
                <span className="bg-bittersweet text-bittersweet bg-opacity-10 rounded-full px-3 py-1 text-xs font-medium">
                  Purchase
                </span>
              ) : (
                <span className="bg-green-100 bg-opacity-10 text-green-600 rounded-full px-3 py-1 text-xs font-medium">
                  Income
                </span>
              )}
            </td>
            <td
              className={`py-4 px-6 font-medium ${transaction.type === "purchase" ? "text-bittersweet" : "text-green-600"}`}
            >
              {transaction.type === "purchase" ? "-" : "+"}$
              {transaction.amount.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );
}
