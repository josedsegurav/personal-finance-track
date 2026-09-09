import { createClient } from "@/utils/supabase/server";
import SidebarNav from "@/components/sidebar";
import ChatBot from "@/components/chatbot/chatBot";
import TransactionsView from "@/components/transactions/TransactionsView";
import {
  getUser,
  getExpenseDetailed,
  getPurchases,
  getCategories,
  getStores,
} from "@/hooks/supabaseQueries";
import { TransactionFilterState } from "@/lib/transactionFilters";

export type TransactionTab = "all" | "expenses" | "purchases";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    month?: string;
    year?: string;
    store?: string;
    category?: string;
    search?: string;
  }>;
}) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const demoAccount = user.email === "lacimaonline@gmail.com";

  const params = await searchParams;
  const today = new Date();

  const initialTab: TransactionTab =
    params.tab === "expenses" || params.tab === "purchases" ? params.tab : "all";

  const initialFilters: TransactionFilterState = {
    month: params.month ?? String(today.getMonth()),
    year: params.year ?? String(today.getFullYear()),
    store: params.store ?? "all",
    category: params.category ?? "all",
    search: params.search ?? "",
  };

  const [expenses, purchases, categories, stores] = await Promise.all([
    getExpenseDetailed(supabase),
    getPurchases(supabase),
    getCategories(supabase),
    getStores(supabase),
  ]);

  return (
    <>
      <SidebarNav activeMenu="transactions" />
      <div className="flex-1 px-4 py-6 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl lg:text-2xl font-semibold text-paynes-gray mb-4 lg:mb-6">
            Transactions
          </h1>
          <TransactionsView
            expenses={expenses ?? []}
            purchases={purchases ?? []}
            categories={categories ?? []}
            stores={stores ?? []}
            initialTab={initialTab}
            initialFilters={initialFilters}
          />
        </div>
      </div>
      <ChatBot account={demoAccount} data={{ expenses: expenses ?? [], purchases: purchases ?? [] }} />
    </>
  );
}