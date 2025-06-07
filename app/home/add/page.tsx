"use client";

import Sidebar from "@/components/sidebar";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import IncomeForm from "@/components/add/incomeform";
import ExpenseForm from "@/components/add/expenseform";

// Type definitions
interface Store {
  id: number;
  store_name: string;
}

interface Category {
  id: number;
  category_name: string;
}

export default function Page() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [stores, setStores] = useState<Store[] | null>(null);
  const [loading, setLoading] = useState({
    stores: true,
  });
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("income");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return redirect("/sign-in");
      }
    };

    getUser();

    const fetchCategories = async () => {
      try {
        setLoading((prev) => ({ ...prev, categories: true }));
        const { data: categories, error } = await supabase
          .from("categories")
          .select("*");

        if (error) throw error;

        setCategories(categories);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      } finally {
        setLoading((prev) => ({ ...prev, categories: false }));
      }
    };

    const fetchStores = async () => {
      try {
        setLoading((prev) => ({ ...prev, stores: true }));
        const { data, error } = await supabase
          .from("stores")
          .select("*")
          .order("store_name", { ascending: true });

        if (error) throw error;

        setStores(data);
      } catch (err) {
        console.error("Error fetching stores:", err);
        setError("Failed to load stores");
      } finally {
        setLoading((prev) => ({ ...prev, stores: false }));
      }
    };

    fetchCategories();
    fetchStores();
  }, [supabase]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Debugging UI
  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-4 py-2 bg-gray-200 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading.stores) {
    return (
      <div className="p-4">
        Loading data...
        {/* You can add a spinner here */}
      </div>
    );
  }

  return (
    <>
    <Sidebar activeMenu="add" />



      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Tabs for transaction type */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-6 font-medium ${
              activeTab === "income"
                ? "text-glaucous border-b-2 border-glaucous"
                : "text-paynes-gray hover:text-glaucous"
            }`}
            onClick={() => handleTabChange("income")}
          >
            Income
          </button>
          <button
            className={`py-3 px-6 font-medium ${
              activeTab === "purchase"
                ? "text-glaucous border-b-2 border-glaucous"
                : "text-paynes-gray hover:text-glaucous"
            }`}
            onClick={() => handleTabChange("expense")}
          >
            Expense
          </button>
        </div>

        {/* Income Form  */}
        {activeTab === "income" && <IncomeForm />}
        {/* Purchases form */}
        {activeTab === "expense" && <ExpenseForm categories={categories} stores={stores} />}
      </div>

    </>
  );
}
