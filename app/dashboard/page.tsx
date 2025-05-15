import { createClient } from '@/utils/supabase/server'
import Transactions from "../../components/dashboard/transactions";
import SidebarNav from '@/components/sidebar';
import { SidebarTrigger } from "@/components/ui/sidebar"


export default async function Page() {
  const supabase = await createClient()

  const { data: income } = await supabase.from("income").select(`*`);
  const { data: purchases } = await supabase.from("purchases").select(`*`);

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

  function totalMonthlyPurchases(month: any) {
    return purchases
    ? purchases.reduce(
        (sum: any, purchase: any) =>
          new Date(purchase.purchase_date).getMonth() === month
            ? sum + parseFloat(purchase.amount)
            : sum,
        0
      )
    : 0;
  }

  const totalNetIncome = totalMonthlyNetIncome(currentMonth);

  const incomeDifference = (totalNetIncome / totalMonthlyNetIncome(currentMonth - 1) * 100);

  const totalPurchases = totalMonthlyPurchases(currentMonth);

  const purchaseDifference = (totalPurchases / totalMonthlyPurchases(currentMonth - 1) * 100);

  const totalPurchasesTaxes = purchases
    ? purchases.reduce(
        (sum: any, purchase: any) =>
          sum + parseFloat(purchase.amount) * parseInt(purchase.taxes),
        0
      )
    : 0;

  const totalAmountPurchases = totalPurchases + totalPurchasesTaxes;

  const balance = totalNetIncome - totalAmountPurchases;



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
              Total Purchases
            </h3>
            <p className="text-2xl font-semibold text-paynes-gray">
              ${totalAmountPurchases.toFixed(2)}
            </p>
            <p className="text-sm text-bittersweet flex items-center mt-2">
              <span>{purchaseDifference.toFixed()}% from last month</span>
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
            <Transactions income={income} purchases={purchases} />
          </table>
        </div>
      </div>
    </div>
  );
}
