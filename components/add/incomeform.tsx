"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { redirect } from "next/navigation";

interface FormData {
  description: string;
  gross_income: string;
  net_income: string;
  date: string;
}

export default function IncomeForm() {
  const supabase = createClient();

  const [formData, setFormData] = useState<FormData>({
    description: "",
    gross_income: "",
    net_income: "",
    date: new Date().toISOString().split("T")[0],
  });

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

      const { data, error } = await supabase
        .from("income")
        .insert([
          {
            description: formData.description,
            gross_income: parseFloat(formData.gross_income),
            net_income: parseFloat(formData.net_income),
            income_date: formData.date,
          },
        ])
        .select();

      if (error) throw error;

      console.log(`Income added:`, data);

      // Reset form
      setFormData({
        description: "",
        gross_income: "",
        net_income: "",
        date: new Date().toISOString().split("T")[0],
      });
      alert(
        "Income added successfully!"
      );
      redirect("/income");
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Failed to add income");
    }
  };

  return (
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
  );
}
