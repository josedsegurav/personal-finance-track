"use client";
import { createClient } from "@/utils/supabase/client";
import { useState, useMemo } from "react";
import { redirect } from "next/navigation";
import StoresEdit from "@/components/add/storesEdit";
import CategoryEdit from "@/components/add/categoriesEdit";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FormExpenseData {
  description: string;
  payment_method: string;
  store: string;
  amount: string;
  total_expense: string;
  date: string;
}

interface FormPurchaseData {
  category: string;
  item: string;
  purchaseAmount: string;
  taxes: string;
  notes: string;
}

export default function ExpenseForm({
  stores,
  categories,
}: {
  stores: any;
  categories: any;
}) {
  const supabase = createClient();

  const [formExpenseData, setformExpenseData] = useState<FormExpenseData>({
    description: "",
    payment_method: "",
    store: "",
    amount: "",
    total_expense: "",
    date: new Date().toISOString().split("T")[0],
  });

  const taxOptions = ["0%", "5%", "12%"];

  const [formPurchaseData, setFormPurchaseData] = useState<FormPurchaseData>({
    category: "",
    item: "",
    purchaseAmount: "",
    taxes: "0%",
    notes: "",
  });

  const [purchasesArray, setPurchasesArray] = useState<FormPurchaseData[]>([]);

  const handleChangeExpense = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setformExpenseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePurchase = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormPurchaseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isExpenseFormComplete = useMemo(() => {
    return Object.values(formExpenseData).every((value) => value.trim() !== "");
  }, [formExpenseData]);

  const isPurchaseFormComplete = useMemo(() => {
    const { item, category, purchaseAmount } = formPurchaseData;

    return (
      category.trim() !== "" &&
      item.trim() !== "" &&
      purchaseAmount.trim() !== ""
    );
  }, [formPurchaseData]);

  const addToPurchaseArray = () => {
    setPurchasesArray((prev) => [...prev, formPurchaseData]);

    setFormPurchaseData({
      item: "",
      category: "",
      purchaseAmount: "",
      taxes: "0%",
      notes: "",
    });
  };

  const isExpenseComplete = useMemo(() => {
    return purchasesArray.length == 0;
  }, [purchasesArray]);

  console.log("purchasesArray", purchasesArray);
  console.log("formExpenseData", formExpenseData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from("expenses")
        .insert([
          {
            description: formExpenseData.description,
            store_id: parseInt(formExpenseData.store),
            amount: parseFloat(formExpenseData.amount),
            total_expense: parseFloat(formExpenseData.total_expense),
            payment_method: formExpenseData.payment_method,
            expense_date: formExpenseData.date,
          },
        ])
        .select();

      if (error) throw error;
      if (data && data[0]) {
        const expenseId = data[0].id;
        purchasesArray.forEach(async (purchase) => {
          try {
            const { data, error } = await supabase
              .from("purchases")
              .insert([
                {
                  item: purchase.item,
                  category_id: parseInt(purchase.category),
                  amount: parseFloat(purchase.purchaseAmount),
                  taxes: parseFloat(purchase.taxes),
                  notes: purchase.notes,
                  expense_id: expenseId,
                },
              ])
              .select();

            if (error) throw error;

            console.log("Purchase added:", data[0]);

            alert("Purchase added successfully!");
            // redirect("/expenses");
          } catch (err) {
            console.error("Error submitting form:", err);
            alert("Failed to add purchase");
          }
        });
      }

      console.log(`Expense added:`, data[0]);

      // Reset form
      setformExpenseData({
        description: "",
        payment_method: "",
        store: "",
        amount: "",
        total_expense: "",
        date: new Date().toISOString().split("T")[0],
      });
      alert("Expense added successfully!");
      redirect("/expenses");
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Failed to add expense");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Item Name */}
          <div>
            <label
              htmlFor="item"
              className="block text-sm font-medium text-paynes-gray mb-2"
            >
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formExpenseData.description}
              onChange={handleChangeExpense}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
              placeholder="A general description of the expense"
              required
            />
          </div>

          {/* Purchase Date */}
          <div>
            <label
              htmlFor="date_of_purchase"
              className="block text-sm font-medium text-paynes-gray mb-2"
            >
              Date of Expense
            </label>
            <input
              type="date"
              id="date_of_purchase"
              name="date"
              value={formExpenseData.date}
              onChange={handleChangeExpense}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label
              htmlFor="payment_method"
              className="block text-sm font-medium text-paynes-gray mb-2"
            >
              Payment Method
            </label>
            <select
              id="payment_method"
              name="payment_method"
              value={formExpenseData.payment_method}
              onChange={handleChangeExpense}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
            >
              <option disabled value="">
                Select a payment method
              </option>
              <option value="credit card">Credit Card</option>
              <option value="debit card">Debit Card</option>
              <option value="cash">Cash</option>
              <option value="bank transfer">Bank Transfer</option>
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
              value={formExpenseData.store}
              onChange={handleChangeExpense}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
              required
            >
              <option value="">Select a store</option>
              {stores &&
                stores.map((store: any) => (
                  <option key={store.id} value={store.id}>
                    {store.store_name}
                  </option>
                ))}
            </select>
            <StoresEdit stores={stores} />
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-paynes-gray mb-2"
            >
              Amount before taxes($)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formExpenseData.amount}
              onChange={handleChangeExpense}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Total Expense */}
          <div>
            <label
              htmlFor="total_expense"
              className="block text-sm font-medium text-paynes-gray mb-2"
            >
              Total Expense ($)
            </label>
            <input
              type="number"
              id="total_expense"
              name="total_expense"
              value={formExpenseData.total_expense}
              onChange={handleChangeExpense}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        <div className="flex flex-col items-end gap-6">
          {/* Add Purchase form */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                disabled={!isExpenseFormComplete}
                className="px-4 py-2 bg-glaucous text-white font-medium rounded-lg hover:bg-glaucous-dark transition-colors focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-opacity-50"
              >
                Add Purchase Details
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add purchases details to the expense</DialogTitle>
                <DialogDescription>
                  Fill this form to add individual items to the expense.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      value={formPurchaseData.item}
                      onChange={handleChangePurchase}
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
                      value={formPurchaseData.category}
                      onChange={handleChangePurchase}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories &&
                        categories.map((category: any) => (
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
                      htmlFor="purchaseAmount"
                      className="block text-sm font-medium text-paynes-gray mb-2"
                    >
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      id="purchaseAmount"
                      name="purchaseAmount"
                      value={formPurchaseData.purchaseAmount}
                      onChange={handleChangePurchase}
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
                      value={formPurchaseData.taxes}
                      onChange={handleChangePurchase}
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
                      value={formPurchaseData.notes}
                      onChange={handleChangePurchase}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                      placeholder="Any additional details about this purchase..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end mb-4">
                  <button
                    disabled={!isPurchaseFormComplete}
                    onClick={addToPurchaseArray}
                    className="px-6 py-2 bg-glaucous text-white font-medium rounded-lg hover:bg-glaucous-dark transition-colors focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-opacity-50"
                  >
                    Add Item
                  </button>
                </div>
                <DialogClose asChild>
                <div className="flex justify-end">
                  <button
                    disabled={isExpenseComplete}
                    className="px-6 py-2 bg-glaucous text-white font-medium rounded-lg hover:bg-glaucous-dark transition-colors focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-opacity-50"
                  >
                    Close to continue adding expense
                  </button>
                </div>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>

                  <button
                    disabled={isExpenseComplete}
                    type="submit"
                    className="px-6 py-2 bg-glaucous text-white font-medium rounded-lg hover:bg-glaucous-dark transition-colors focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-opacity-50"
                  >
                    Add Expense
                  </button>

        </div>
      </form>
    </div>
  );
}
