"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import CategoryEdit from "@/components/add/categoriesEdit";


// Type definitions
interface Category {
  id: number;
  category_name: string;
}

interface FormData {
  category: string;
  item: string;
  amount: string;
  taxes: string;
  notes: string;
}

export default function AddPurchases({ expenseData }: any) {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState({
    categories: true,
  });
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const taxOptions = ["0%", "5%", "12%"];

  const [formData, setFormData] = useState<FormData>({
    category: "",
    item: "",
    amount: "",
    taxes: "0%",
    notes: "",
  });

const [expenseId, setExpenseId] = useState<string | null>(null);


  useEffect(() => {
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

    fetchCategories();
  }, [supabase]);

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
      const { data, error } = await supabase
        .from("expenses")
        .insert([
          {
            description: expenseData.description,
            store_id: parseInt(expenseData.store),
            amount: parseFloat(expenseData.amount),
            total_expense: parseFloat(expenseData.total_expense),
            payment_method: expenseData.payment_method,
            expense_date: expenseData.date,
          },
        ])
        .select();

      if (error) throw error;


      if (data && data[0]) {setExpenseId(data[0].id)}

      console.log(`Expense added:`, data);

    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Failed to add expense");
    }


    try {
      const { data, error } = await supabase
        .from("purchases")
        .insert([
          {
            item: formData.item,
            category_id: parseInt(formData.category),
            amount: parseFloat(formData.amount),
            taxes: parseFloat(formData.taxes),
            notes: formData.notes,
            expense_id: expenseId,
          },
        ])
        .select();

      if (error) throw error;

      console.log("Purchase added:", data[0]);

      // Reset form
      setFormData({
        item: "",
        category: "",
        amount: "",
        taxes: "0%",
        notes: "",
      });
      alert(
        "Purchase added successfully!"
      );
      // redirect("/expenses");
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Failed to add purchase");
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

  if (loading.categories) {
    return (
      <div className="p-4">
        Loading data...
        {/* You can add a spinner here */}
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Item Name */}
            <div className="md:col-span-2">
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
              <CategoryEdit categories={categories} />
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
              Add Expense
            </button>
          </div>

      </div>
    </div>
  );
}
