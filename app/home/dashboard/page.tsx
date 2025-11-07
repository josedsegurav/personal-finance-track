import { createClient } from "@/utils/supabase/server";
import Transactions from "../../../components/dashboard/transactions";
import SidebarNav from "@/components/sidebar";
import { redirect } from "next/navigation";
import ChatBot from "@/components/chatbot/chatBot";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: income } = await supabase.from("income").select(`*`);
  const { data: expenses } = await supabase.from("expenses").select(`*`);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();

  function totalMonthlyNetIncome(month: any) {
    return income
      ? income.reduce(
          (sum: any, eachIncome: any) =>
            new Date(eachIncome.income_date).getMonth() === month
              ? sum + parseFloat(eachIncome.net_income)
              : sum,
          0
        )
      : 0;
  }

  function totalMonthlyExpenses(month: any) {
    return expenses
      ? expenses.reduce(
          (sum: any, expense: any) =>
            new Date(expense.expense_date).getMonth() === month
              ? sum + parseFloat(expense.total_expense)
              : sum,
          0
        )
      : 0;
  }

  const totalNetIncome = totalMonthlyNetIncome(currentMonth);

  const incomeDifference =
    (totalNetIncome / totalMonthlyNetIncome(currentMonth - 1)) * 100;

  const totalExpenses = totalMonthlyExpenses(currentMonth);

  const expenseDifference =
    (totalExpenses / totalMonthlyExpenses(currentMonth - 1)) * 100;

  const balance = totalNetIncome - totalExpenses;

  return (
    <>
      <SidebarNav activeMenu="dashboard" />
      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8">
  <h1 className="text-xl lg:text-2xl font-semibold text-paynes-gray mb-4 lg:mb-6">
    Dashboard
  </h1>

  {/* Summary Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80">
          Total Income
        </h3>
        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-500 bg-opacity-10 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      </div>
      <p className="text-xl lg:text-2xl font-semibold text-paynes-gray mb-1">
        ${totalNetIncome.toFixed(2)}
      </p>
      <p className="text-xs lg:text-sm text-green-500 flex items-center">
        <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <span>{incomeDifference.toFixed()}% from last month</span>
      </p>
    </div>

    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80">
          Total Expenses
        </h3>
        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-bittersweet bg-opacity-10 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 lg:w-5 lg:h-5 text-bittersweet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </div>
      </div>
      <p className="text-xl lg:text-2xl font-semibold text-paynes-gray mb-1">
        ${totalExpenses.toFixed(2)}
      </p>
      <p className="text-xs lg:text-sm text-bittersweet flex items-center">
        <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        <span>{expenseDifference.toFixed()}% from last month</span>
      </p>
    </div>

    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80">
          Net Balance
        </h3>
        <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center ${
          balance >= 0
            ? 'bg-columbia-blue bg-opacity-20'
            : 'bg-bittersweet bg-opacity-10'
        }`}>
          <svg className={`w-4 h-4 lg:w-5 lg:h-5 ${
            balance >= 0 ? 'text-columbia-blue' : 'text-bittersweet'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      <p className={`text-xl lg:text-2xl font-semibold mb-1 ${
        balance >= 0 ? 'text-paynes-gray' : 'text-bittersweet'
      }`}>
        ${balance.toFixed(2)}
      </p>
      <p className={`text-xs lg:text-sm flex items-center ${
        balance >= 0 ? 'text-columbia-blue' : 'text-bittersweet'
      }`}>
        <span>{balance >= 0 ? 'Positive' : 'Negative'} balance</span>
      </p>
    </div>

    {/* Optional 4th card for additional metric */}
    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-100 sm:col-span-2 lg:col-span-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80">
          This Month
        </h3>
        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-columbia-blue bg-opacity-20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 lg:w-5 lg:h-5 text-columbia-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      <p className="text-xl lg:text-2xl font-semibold text-paynes-gray mb-1">
        {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </p>
      <p className="text-xs lg:text-sm text-columbia-blue flex items-center">
        <span>Current period</span>
      </p>
    </div>
  </div>

  {/* Transactions Section */}
  <div className="bg-white rounded-lg shadow-sm">
    <Transactions
      totalExpenses={totalExpenses}
      totalNetIncome={totalNetIncome}
      income={income}
      expenses={expenses}
    />
  </div>
</div>
<ChatBot data={[income, expenses]}/>
    </>
  );
}
