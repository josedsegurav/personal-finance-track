
import { createClient } from '@/utils/supabase/server'
import FiltersAndMovements from "../../components/income/filtermovements"
import SidebarNav from '@/components/sidebar';
import { SidebarTrigger } from "@/components/ui/sidebar"

export default async function Purchases() {
  const supabase = await createClient()
  const { data: income } = await supabase.from("income").select(`*`);

  const currentDate = new Date();
  const currentMonth = new Intl.DateTimeFormat("en-US", { month: "long" }).format(currentDate);

//   // Calculate totals
  const totalGrossIncome =
  income ? income.filter(
    (eachIncome: any) =>
      new Date(eachIncome.income_date).getFullYear() == currentDate.getFullYear()).filter(
        (eachIncome: any) =>
          new Date(eachIncome.income_date).getMonth() == currentDate.getMonth()
      ).reduce((sum: any, eachIncome: any) => sum + eachIncome.gross_income, 0)
  : 0;

    const totalNetIncome =
    income ? income.filter(
      (eachIncome: any) =>
        new Date(eachIncome.income_date).getFullYear() == currentDate.getFullYear()).filter(
          (eachIncome: any) =>
            new Date(eachIncome.income_date).getMonth() == currentDate.getMonth()
        ).reduce((sum: any, eachIncome: any) => sum + eachIncome.net_income, 0)
    : 0;

  const totalTaxes =
  income ? income.filter(
    (eachIncome: any) =>
      new Date(eachIncome.income_date).getFullYear() == currentDate.getFullYear()).filter(
        (eachIncome: any) =>
          new Date(eachIncome.income_date).getMonth() == currentDate.getMonth()
      ).reduce(
        (sum: any, eachIncome: any) =>
          sum + eachIncome.gross_income - eachIncome.net_income,
        0
      )
    : 0;


  return (
    <>
      <div className="flex min-h-screen bg-ghost-white">
        {/* Sidebar would be here in a full layout */}
        <SidebarNav activeMenu="income"/>
        <SidebarTrigger/>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-semibold text-paynes-gray mb-6">
            Income
          </h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-paynes-gray opacity-80 mb-2">
                Total Income
              </h3>
              <p className="text-2xl font-semibold text-bittersweet">
                ${totalNetIncome.toFixed(2)}
              </p>
              <p className="text-sm text-paynes-gray mt-2">
                {currentMonth} {currentDate.getFullYear()}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-paynes-gray opacity-80 mb-2">
                Total Taxes
              </h3>
              <p className="text-2xl font-semibold text-paynes-gray">
                ${totalTaxes.toFixed(2)}
              </p>
              <p className="text-sm text-paynes-gray mt-2">
              {currentMonth} {currentDate.getFullYear()}
              </p>
            </div>

          </div>

          {/* Chart Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-lg font-semibold text-paynes-gray mb-4">
              purchase Categories
            </h2>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <p>purchase Breakdown by Category</p>
                <p className="text-sm">(Pie chart will be shown here)</p>
              </div>
            </div>
          </div>

          {/* Filters and Transactions */}

          <FiltersAndMovements
          currentMonth = {currentMonth}
          currentDate = {currentDate}
          income = {income}
          currentMonthNetIncome={totalNetIncome}
          currentMonthGrossIncome={totalGrossIncome}
          currentMonthTaxes={totalTaxes}
          />

        </div>
      </div>
    </>
  );
}
