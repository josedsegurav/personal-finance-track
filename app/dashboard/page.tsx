import { createClient } from '@/utils/supabase/server'
import Transactions from "../../components/dashboard/transactions";
import SidebarNav from '@/components/sidebar';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";


export default async function Page() {
  const supabase = await createClient()
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

  const incomeDifference = (totalNetIncome / totalMonthlyNetIncome(currentMonth - 1) * 100);

  const totalExpenses = totalMonthlyExpenses(currentMonth);

  const expenseDifference = (totalExpenses / totalMonthlyExpenses(currentMonth - 1) * 100);

  const balance = totalNetIncome - totalExpenses;



  return (
    // <pre>{JSON.stringify(income, null, 2)}</pre>
    <div className="flex min-h-screen bg-ghost-white">
      {/* Sidebar */}
    <SidebarNav activeMenu="dashboard"/>
    <SidebarTrigger/>


      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold text-paynes-gray mb-6">
          Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-paynes-gray opacity-80 mb-2">
              Total Income
            </h3>
            <p className="text-2xl font-semibold text-paynes-gray">
              ${totalNetIncome.toFixed(2)}
            </p>
            <p className="text-sm text-green-500 flex items-center mt-2">
              <span>{incomeDifference.toFixed()}% from last month</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-paynes-gray opacity-80 mb-2">
              Total expenses
            </h3>
            <p className="text-2xl font-semibold text-paynes-gray">
              ${totalExpenses.toFixed(2)}
            </p>
            <p className="text-sm text-bittersweet flex items-center mt-2">
              <span>{expenseDifference.toFixed()}% from last month</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-paynes-gray opacity-80 mb-2">
              Net Balance
            </h3>
            <p className="text-2xl font-semibold text-paynes-gray">
              ${balance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <h2 className="text-xl font-semibold text-paynes-gray mb-4">
          Monthly Overview
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 h-64 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p>Income vs Expenses Chart</p>
            <p className="text-sm">(Chart visualization will be shown here)</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <h2 className="text-xl font-semibold text-paynes-gray mb-4">
          Recent Transactions
        </h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                  Type
                </th>
                <th className="text-left py-4 px-6 text-paynes-gray font-medium">
                  Amount
                </th>
              </tr>
            </thead>
            <Transactions income={income} expenses={expenses} />
          </table>
        </div>
      </div>
    </div>
  );
}
