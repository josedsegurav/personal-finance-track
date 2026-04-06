"use client";
import IncomeForm from "@/components/add/incomeform";
import ExpenseForm from "@/components/add/expenseform";
import ManageTab from "@/components/add/ManageTab";
import { Suspense, useState } from "react";
import { Category, Store } from "@/app/types";

type TabContentProps = {
    categoriesData: Category[] | null;
    storesData: Store[] | null;
};

type Tab = "income" | "expense" | "manage";

export default function TabContent({ categoriesData, storesData }: TabContentProps) {
    const [activeTab, setActiveTab] = useState<Tab>("income");

    const tabs: { id: Tab; label: string }[] = [
        { id: "income",  label: "Income"  },
        { id: "expense", label: "Expense" },
        { id: "manage",  label: "Manage"  },
    ];

    return (
        <div className="w-3/4 mx-auto">
            {/* Tab bar */}
            <div className="flex border-b border-gray-200 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`py-3 px-6 font-medium ${
                            activeTab === tab.id
                                ? "text-glaucous border-b-2 border-glaucous"
                                : "text-paynes-gray hover:text-glaucous"
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <Suspense fallback={<div className="p-4">Loading data…</div>}>
                {activeTab === "income" && <IncomeForm />}
                {activeTab === "expense" && (
                    <ExpenseForm
                        categories={categoriesData || []}
                        stores={storesData || []}
                    />
                )}
                {activeTab === "manage" && (
                    <ManageTab
                        categoriesData={categoriesData || []}
                        storesData={storesData || []}
                    />
                )}
            </Suspense>
        </div>
    );
}