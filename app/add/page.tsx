// "use client";

// import { useState } from 'react';

// export default function AddDataForm() {
//   const [activeTab, setActiveTab] = useState('income');
//   const [formData, setFormData] = useState({
//     type: 'income',
//     amount: '',
//     date: new Date().toISOString().split('T')[0],
//     description: '',
//     category: '',
//     taxAmount: '',
//     store: '',
//     notes: ''
//   });

//   console.log(formData);

//   const handleChange = (e: any) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e: any) => {
//     e.preventDefault();
//     console.log('Form submitted:', formData);
//     // Here you would connect to Supabase
//   };

//   const handleTabChange = (tab: string) => {
//     setActiveTab(tab);
//     setFormData(prev => ({
//       ...prev,
//       type: tab
//     }));
//   };

//   // Sample categories
//   const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other'];
//   const expenseCategories = ['Food', 'Housing', 'Transportation', 'Entertainment', 'Utilities', 'Shopping', 'Health'];

//   return (
//     <div className="flex min-h-screen bg-ghost-white">
//       {/* Sidebar would be here in a full layout */}

//       {/* Main Content */}
//       <div className="flex-1 p-8">
//         <h1 className="text-2xl font-semibold text-paynes-gray mb-6">Add Transaction</h1>

//         {/* Tabs for transaction type */}
//         <div className="flex border-b border-gray-200 mb-6">
//           <button
//             className={`py-3 px-6 font-medium ${activeTab === 'income'
//               ? 'text-glaucous border-b-2 border-glaucous'
//               : 'text-paynes-gray hover:text-glaucous'}`}
//             onClick={() => handleTabChange('income')}
//           >
//             Income
//           </button>
//           <button
//             className={`py-3 px-6 font-medium ${activeTab === 'expense'
//               ? 'text-glaucous border-b-2 border-glaucous'
//               : 'text-paynes-gray hover:text-glaucous'}`}
//             onClick={() => handleTabChange('expense')}
//           >
//             Expense
//           </button>
//         </div>

//         {/* Form */}
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <form onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Amount Field */}
//               <div>
//                 <label className="block text-paynes-gray font-medium mb-2">Amount</label>
//                 <div className="relative">
//                   <span className="absolute left-3 top-3 text-gray-500">$</span>
//                   <input
//                     type="number"
//                     name="amount"
//                     value={formData.amount}
//                     onChange={handleChange}
//                     className="bg-white text-black w-full py-2 pl-8 pr-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-columbia-blue"
//                     placeholder="0.00"
//                     step="0.01"
//                     required
//                   />
//                 </div>
//               </div>

//               {/* Date Field */}
//               <div>
//                 <label className="block text-paynes-gray font-medium mb-2">Date</label>
//                 <input
//                   type="date"
//                   name="date"
//                   value={formData.date}
//                   onChange={handleChange}
//                   className="bg-white text-black w-full py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-columbia-blue"
//                   required
//                 />
//               </div>

//               {/* Description Field */}
//               <div>
//                 <label className="block text-paynes-gray font-medium mb-2">Description</label>
//                 <input
//                   type="text"
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   className="bg-white text-black w-full py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-columbia-blue"
//                   placeholder="Transaction description"
//                   required
//                 />
//               </div>

//               {/* Category Field */}
//               <div>
//                 <label className="block text-paynes-gray font-medium mb-2">Category</label>
//                 <select
//                   name="category"
//                   value={formData.category}
//                   onChange={handleChange}
//                   className="bg-white text-black w-full py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-columbia-blue"
//                   required
//                 >
//                   <option value="">Select a category</option>
//                   {activeTab === 'income' ? (
//                     incomeCategories.map(cat => (
//                       <option key={cat} value={cat}>{cat}</option>
//                     ))
//                   ) : (
//                     expenseCategories.map(cat => (
//                       <option key={cat} value={cat}>{cat}</option>
//                     ))
//                   )}
//                 </select>
//               </div>

//               {/* Tax Amount Field */}
//               <div>
//                 <label className="block text-paynes-gray font-medium mb-2">Tax Amount (Optional)</label>
//                 <div className="relative">
//                   <span className="absolute left-3 top-3 text-gray-500">$</span>
//                   <input
//                     type="number"
//                     name="taxAmount"
//                     value={formData.taxAmount}
//                     onChange={handleChange}
//                     className="bg-white text-black w-full py-2 pl-8 pr-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-columbia-blue"
//                     placeholder="0.00"
//                     step="0.01"
//                   />
//                 </div>
//               </div>

//               {/* Store Field - Only for Expenses */}
//               {activeTab === 'expense' && (
//                 <div>
//                   <label className="block text-paynes-gray font-medium mb-2">Store/Vendor</label>
//                   <input
//                     type="text"
//                     name="store"
//                     value={formData.store}
//                     onChange={handleChange}
//                     className="bg-white text-black w-full py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-columbia-blue"
//                     placeholder="Where was this purchased?"
//                   />
//                 </div>
//               )}

//               {/* Notes Field */}
//               <div className="md:col-span-2">
//                 <label className="block text-paynes-gray font-medium mb-2">Notes (Optional)</label>
//                 <textarea
//                   name="notes"
//                   value={formData.notes}
//                   onChange={handleChange}
//                   className="bg-white text-black w-full py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-columbia-blue"
//                   rows={3}
//                   placeholder="Additional details about this transaction"
//                 ></textarea>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <div className="mt-6">
//               <button
//                 type="submit"
//                 className="px-6 py-2 bg-glaucous text-white font-medium rounded hover:bg-opacity-90 transition-colors"
//               >
//                 Save Transaction
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import Sidebar from "@/components/sidebar";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar"

// Type definitions
interface Category {
  id: number;
  category_name: string;
}

interface Store {
  id: number;
  store_name: string;
}

interface FormData {
  description: string;
  gross_income: string;
  net_income: string;
  item: string;
  category: string;
  store: string;
  amount: string;
  taxes: string;
  notes: string;
  date: string;
}

export default function Page() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [stores, setStores] = useState<Store[] | null>(null);
  const [loading, setLoading] = useState({
    categories: true,
    stores: true,
  });
  const [error, setError] = useState<string | null>(null);

  const taxOptions = ["0%", "5%", "12%"];
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("income");

  const [formData, setFormData] = useState<FormData>({
    description: "",
    gross_income: "",
    net_income: "",
    item: "",
    category: "",
    store: "",
    amount: "",
    taxes: "0%",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading((prev) => ({ ...prev, categories: true }));
        const { data: categories, error } = await supabase
          .from("categories")
          .select("*");

        if (error) throw error;

        setCategories(categories);
        console.log("Categories:", categories);
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
        console.log("Stores:", data);
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Determine which table to insert into based on activeTab
      const table = activeTab === "income" ? "income" : "purchases";

      const { data, error } = await supabase
        .from(table)
        .insert([
          activeTab === "income"
            ? {
                description: formData.description,
                gross_income: parseFloat(formData.gross_income),
                net_income: parseFloat(formData.net_income),
                income_date: formData.date,
              }
            : {
                item: formData.item,
                category_id: parseInt(formData.category),
                store_id: parseInt(formData.store),
                amount: parseFloat(formData.amount),
                taxes: parseFloat(formData.taxes),
                notes: formData.notes,
                purchase_date: formData.date,
              },
        ])
        .select();

      if (error) throw error;

      console.log(`${activeTab} added:`, data);
      alert(
        `${activeTab === "income" ? "Income" : "Purchase"} added successfully!`
      );

      // Reset form
      setFormData({
        description: "",
        gross_income: "",
        net_income: "",
        item: "",
        category: "",
        store: "",
        amount: "",
        taxes: "0%",
        notes: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      console.error("Error submitting form:", err);
      alert(`Failed to add ${activeTab === "income" ? "income" : "purchase"}`);
    }
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

  if (loading.categories || loading.stores) {
    return (
      <div className="p-4">
        Loading data...
        {/* You can add a spinner here */}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ghost-white">
      {/* Sidebar - Same as your existing sidebar */}
      <Sidebar activeMenu="add"/>
      <SidebarTrigger/>

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
            onClick={() => handleTabChange("purchase")}
          >
            Purchase
          </button>
        </div>

        {/* Income Form  */}
        {activeTab === "income" && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-paynes-gray mb-2"
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    placeholder="Salary, Freelance, Bonus, etc."
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-paynes-gray mb-2"
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="gross_income"
                    className="block text-sm font-medium text-paynes-gray mb-2"
                  >
                    Gross Income ($)
                  </label>
                  <input
                    type="number"
                    id="gross_income"
                    name="gross_income"
                    value={formData.gross_income}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="net_income"
                    className="block text-sm font-medium text-paynes-gray mb-2"
                  >
                    Net Income ($)
                  </label>
                  <input
                    type="number"
                    id="net_income"
                    name="net_income"
                    value={formData.net_income}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-glaucous text-white font-medium rounded-lg hover:bg-glaucous-dark transition-colors focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-opacity-50"
                >
                  Add Income
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Purchases form */}
        {activeTab === "purchase" && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Item Name */}
                <div>
                  <label
                    htmlFor="item"
                    className="block text-sm font-medium text-paynes-gray mb-2"
                  >
                    Item Name
                  </label>
                  <input
                    type="text"
                    id="item"
                    name="item"
                    value={formData.item}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    placeholder="What did you buy?"
                    required
                  />
                </div>

                {/* Purchase Date */}
                <div>
                  <label
                    htmlFor="date_of_purchase"
                    className="block text-sm font-medium text-paynes-gray mb-2"
                  >
                    Date of Purchase
                  </label>
                  <input
                    type="date"
                    id="date_of_purchase"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    required
                  />
                </div>

                {/* Category Dropdown */}
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-paynes-gray mb-2"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories &&
                      categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.category_name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Store Dropdown */}
                <div>
                  <label
                    htmlFor="store"
                    className="block text-sm font-medium text-paynes-gray mb-2"
                  >
                    Store
                  </label>
                  <select
                    id="store"
                    name="store"
                    value={formData.store}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    required
                  >
                    <option value="">Select a store</option>
                    {stores &&
                      stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.store_name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-paynes-gray mb-2"
                  >
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Tax Rate */}
                <div>
                  <label
                    htmlFor="taxes"
                    className="block text-sm font-medium text-paynes-gray mb-2"
                  >
                    Tax Rate
                  </label>
                  <select
                    id="taxes"
                    name="taxes"
                    value={formData.taxes}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                  >
                    {taxOptions.map((tax) => (
                      <option key={tax} value={tax}>
                        {tax}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Full-width Notes field */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-paynes-gray mb-2"
                  >
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                    placeholder="Any additional details about this purchase..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-glaucous text-white font-medium rounded-lg hover:bg-glaucous-dark transition-colors focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-opacity-50"
                >
                  Add Purchase
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
