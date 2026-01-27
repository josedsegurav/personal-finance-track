"use client";
import IncomeForm from "@/components/add/incomeform";
import ExpenseForm from "@/components/add/expenseform";
import { Suspense, useState } from "react";
import { Category, Store } from "@/app/types"

type TabContentProps = {
    categoriesData: Category[] | null;
    storesData: Store[] | null;
};

export default function TabContent({ categoriesData, storesData }: TabContentProps) {
    const [ categories ] = useState<Category[] | null>(categoriesData);
    const [ stores ] = useState<Store[] | null>(storesData);

    const [ activeTab, setActiveTab ] = useState("income");

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };


    return (

        <div className="flex-1 p-8">
            {/* Tabs for transaction type */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`py-3 px-6 font-medium ${activeTab === "income"
                        ? "text-glaucous border-b-2 border-glaucous"
                        : "text-paynes-gray hover:text-glaucous"
                        }`}
                    onClick={() => handleTabChange("income")}
                >
                    Income
                </button>
                <button
                    className={`py-3 px-6 font-medium ${activeTab === "purchase"
                        ? "text-glaucous border-b-2 border-glaucous"
                        : "text-paynes-gray hover:text-glaucous"
                        }`}
                    onClick={() => handleTabChange("expense")}
                >
                    Expense
                </button>
            </div>
            <Suspense fallback={<div className="p-4">
                Loading data...
                {/* You can add a spinner here */}
            </div>}>
                {/* Income Form  */}
                {activeTab === "income" && <IncomeForm />}
                {/* Purchases form */}
                {activeTab === "expense" && <ExpenseForm categories={categories} stores={stores} />}
            </Suspense>
        </div>

    )
}