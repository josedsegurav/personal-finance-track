import { createClient } from "@/utils/supabase/server";
import Transactions from "../../../components/expenses/transactions";
import Sidebar from "@/components/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";

import { escape } from "querystring";

export default async function expenses() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: expenses } = await supabase.from("expenses").select(`
    id,
    created_at,
    amount,
    description,
    stores (id, store_name),
    payment_method,
    expense_date,
    user_id,
    total_expense
`);

  const { data: stores } = await supabase.from("stores").select();

  const currentDate = new Date();
  const currentMonth = new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(currentDate);

  const totalexpenses = expenses
    ? expenses
        .filter(
          (expense: any) =>
            new Date(expense.expense_date).getFullYear() ==
            currentDate.getFullYear()
        )
        .filter(
          (expense: any) =>
            new Date(expense.expense_date).getUTCMonth() ==
            currentDate.getMonth()
        )
        .reduce((sum: any, expense: any) => sum + expense.amount, 0)
    : 0;

  const totalExpensesAfterTax = expenses
    ? expenses
        .filter(
          (expense: any) =>
            new Date(expense.expense_date).getFullYear() ===
            currentDate.getFullYear()
        )
        .filter(
          (expense: any) =>
            new Date(expense.expense_date).getUTCMonth() ===
            currentDate.getMonth()
        )
        .reduce((sum: any, expense: any) => sum + expense.total_expense, 0)
    : 0;

  const totalTaxes = expenses ? totalExpensesAfterTax - totalexpenses : 0;

  const monthexpenses = expenses
    ? expenses
        .filter(
          (expense) =>
            new Date(expense.expense_date).getFullYear() ==
            currentDate.getFullYear()
        )
        .filter(
          (expense) =>
            new Date(expense.expense_date).getUTCMonth() ===
            currentDate.getMonth()
        )
    : [];

  return (
    <>
  <Sidebar activeMenu="expenses" />

    {/* Main Content */}
    <div className="flex-1 px-4 py-6 lg:p-8 pt-20 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl lg:text-2xl font-semibold text-paynes-gray mb-4 lg:mb-6">
          Expenses
        </h1>

        {/* Mobile-first Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">
              Total expenses
            </h3>
            <p className="text-xl lg:text-2xl font-semibold text-bittersweet">
              ${totalExpensesAfterTax.toFixed(2)}
            </p>
            <p className="text-xs lg:text-sm text-paynes-gray mt-1 lg:mt-2">
              {currentMonth} {currentDate.getFullYear()}
            </p>
          </div>

          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">
              Total Taxes
            </h3>
            <p className="text-xl lg:text-2xl font-semibold text-paynes-gray">
              ${totalTaxes.toFixed(2)}
            </p>
            <p className="text-xs lg:text-sm text-paynes-gray mt-1 lg:mt-2">
              {currentMonth} {currentDate.getFullYear()}
            </p>
          </div>

          {/* Optional third card for mobile balance */}
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm sm:col-span-2 lg:col-span-1">
            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-2">
              Pre-tax Amount
            </h3>
            <p className="text-xl lg:text-2xl font-semibold text-columbia-blue">
              ${(totalExpensesAfterTax - totalTaxes).toFixed(2)}
            </p>
            <p className="text-xs lg:text-sm text-paynes-gray mt-1 lg:mt-2">
              Before taxes
            </p>
          </div>
        </div>

        {/* Transactions Component */}
        <Transactions
          currentDate={currentDate}
          expenses={expenses}
          stores={stores}
          currentMonthexpenses={totalexpenses}
          currentMonthExpensesAfterTax={totalExpensesAfterTax}
          monthexpenses={monthexpenses}
          currentMonth={currentMonth}
        />
      </div>
    </div>

</>
  );
}
