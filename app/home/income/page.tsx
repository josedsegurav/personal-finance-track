
import { createClient } from '@/utils/supabase/server'
import FiltersAndMovements from "../../../components/income/filtermovements"
import SidebarNav from '@/components/sidebar';
import { SidebarTrigger } from "@/components/ui/sidebar"
import { redirect } from "next/navigation";

export default async function Purchases() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: income } = await supabase.from("income").select(`*`);

  const currentDate = new Date();
  const currentMonth = new Intl.DateTimeFormat("en-US", { month: "long" }).format(currentDate);

//   // Calculate totals
  const totalGrossIncome =
  income ? income.filter(
    (eachIncome: any) =>
      new Date(eachIncome.income_date).getFullYear() == currentDate.getFullYear()).filter(
        (eachIncome: any) =>
          new Date(eachIncome.income_date).getUTCMonth() == currentDate.getMonth()
      ).reduce((sum: any, eachIncome: any) => sum + eachIncome.gross_income, 0)
  : 0;

    const totalNetIncome =
    income ? income.filter(
      (eachIncome: any) =>
        new Date(eachIncome.income_date).getFullYear() == currentDate.getFullYear()).filter(
          (eachIncome: any) =>
            new Date(eachIncome.income_date).getUTCMonth() == currentDate.getMonth()
        ).reduce((sum: any, eachIncome: any) => sum + eachIncome.net_income, 0)
    : 0;

  const totalTaxes =
  income ? income.filter(
    (eachIncome: any) =>
      new Date(eachIncome.income_date).getFullYear() == currentDate.getFullYear()).filter(
        (eachIncome: any) =>
          new Date(eachIncome.income_date).getUTCMonth() == currentDate.getMonth()
      ).reduce(
        (sum: any, eachIncome: any) =>
          sum + eachIncome.gross_income - eachIncome.net_income,
        0
      )
    : 0;


  return (
    <>
    <SidebarNav activeMenu="income"/>




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

    </>
  );
}
