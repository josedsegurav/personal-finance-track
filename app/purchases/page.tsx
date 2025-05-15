import { createClient } from '@/utils/supabase/server'
import FiltersAndTransactions from "../../components/purchases/filterstransactions"
import Sidebar from "@/components/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar"

export default async function Purchases() {
  const supabase = await createClient()

  const { data: purchases } = await supabase.from("purchases").select(`
    id,
    created_at,
    item,
    categories (id, category_name),
    stores (id, store_name),
    amount,
    taxes,
    notes,
    user_id,
    purchase_date
`);

const { data: categories } = await supabase.from("categories").select();
const { data: stores } = await supabase.from("stores").select();


  const currentDate = new Date();
  const currentMonth = new Intl.DateTimeFormat("en-US", { month: "long" }).format(currentDate);

//   // Calculate totals
  const totalPurchases = purchases
    ? purchases.filter((purchase: any) => {
      new Date(purchase.purchase_date).getFullYear() === currentDate.getFullYear()
    }).filter((purchase: any) => {
      new Date(purchase.purchase_date).getMonth() === currentDate.getMonth()
    }).reduce((sum: any, purchase: any) => sum + purchase.amount, 0)
    : 0;

  const totalTaxes = purchases
    ? purchases.filter((purchase: any) => {
      new Date(purchase.purchase_date).getFullYear() === currentDate.getFullYear()
    }).filter((purchase: any) => {
      new Date(purchase.purchase_date).getMonth() === currentDate.getMonth()
    }).reduce(
        (sum: any, purchase: any) =>
          sum + purchase.amount * purchase.taxes,
        0
      )
    : 0;

  return (
    <>
      <div className="flex min-h-screen bg-ghost-white">
        {/* Sidebar would be here in a full layout */}
        <Sidebar activeMenu="purchases"/>
        <SidebarTrigger/>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-semibold text-paynes-gray mb-6">
            Purchases
          </h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-paynes-gray opacity-80 mb-2">
                Total Purchases
              </h3>
              <p className="text-2xl font-semibold text-bittersweet">
                ${totalPurchases.toFixed(2)}
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

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-paynes-gray opacity-80 mb-2">
                Average purchase
              </h3>
              <p className="text-2xl font-semibold text-paynes-gray">
                $
                {purchases
                  ? (totalPurchases / purchases.length).toFixed(2)
                  : "0.00"}
              </p>
              <p className="text-sm text-paynes-gray mt-2">Per transaction</p>
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

          <FiltersAndTransactions
          currentDate = {currentDate}
          categories = {categories}
          purchases = {purchases}
          stores = {stores}
          currentMonthPurchases = {totalPurchases}
          currentMonthTaxes = {totalTaxes}
          />

        </div>
      </div>
    </>
  );
}
