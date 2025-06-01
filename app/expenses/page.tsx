import { createClient } from "@/utils/supabase/server";
import Transactions from "../../components/expenses/transactions";
import Sidebar from "@/components/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";

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

console.log("expenses", expenses);

  const { data: stores } = await supabase.from("stores").select();

  const currentDate = new Date();
  const currentMonth = new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(currentDate);


  const totalexpenses = expenses
    ? expenses
        .filter((expense: any) =>
          new Date(expense.expense_date).getFullYear() ==
            currentDate.getFullYear()
        )
        .filter((expense: any) =>
          new Date(expense.expense_date).getMonth() ==
            currentDate.getMonth()
        )
        .reduce((sum: any, expense: any) => sum + expense.amount, 0)
    : 0;

    const totalExpensesAfterTax = expenses
    ? expenses
        .filter((expense: any) =>
          new Date(expense.expense_date).getFullYear() ===
            currentDate.getFullYear()
        )
        .filter((expense: any) =>
          new Date(expense.expense_date).getMonth() ===
            currentDate.getMonth()
        )
        .reduce((sum: any, expense: any) => sum + expense.total_expense, 0)
    : 0;

  const totalTaxes = expenses
    ? totalExpensesAfterTax - totalexpenses
    : 0;

  return (
    <>
      <div className="flex min-h-screen bg-ghost-white">
        {/* Sidebar would be here in a full layout */}
        <Sidebar activeMenu="expenses" />
        <SidebarTrigger />

        {/* Main Content */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-semibold text-paynes-gray mb-6">
            expenses
          </h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-paynes-gray opacity-80 mb-2">
                Total expenses
              </h3>
              <p className="text-2xl font-semibold text-bittersweet">
                ${totalExpensesAfterTax.toFixed(2)}
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
              Expense Breakdown
            </h2>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <p>expense Breakdown by Category</p>
                <p className="text-sm">(Pie chart will be shown here)</p>
              </div>
            </div>
          </div>

          {/* Filters and Transactions */}

          <Transactions
            currentDate={currentDate}
            expenses={expenses}
            stores={stores}
            currentMonthexpenses={totalexpenses}
            currentMonthExpensesAfterTax={totalExpensesAfterTax}
            currentMonthTaxes={totalTaxes}
          />
        </div>
      </div>
    </>
  );
}
