import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface FormExpenseData {
  description: string;
  payment_method: string;
  store: string;
  amount: string;
  total_expense: string;
  date: string;
}

export default function EditExpense(props: any) {
  const supabase = createClient();
  const [formExpenseData, setformExpenseData] = useState<FormExpenseData>({
    description: props.expense.description,
    payment_method: props.expense.payment_method,
    store: props.expense.stores.id.toString(),
    amount: props.expense.amount.toString(),
    total_expense: props.expense.total_expense.toString(),
    date: props.expense.expense_date,
  });

  const handleChange = (
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

  const handleEdit = async () => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .update([
          {
            description: formExpenseData.description,
            store_id: parseInt(formExpenseData.store),
            amount: parseFloat(formExpenseData.amount),
            total_expense: parseFloat(formExpenseData.total_expense),
            payment_method: formExpenseData.payment_method,
            expense_date: formExpenseData.date,
          },
        ])
        .eq("id", props.expense.id)
        .select();

      if (error) throw error;

      console.log(`Updated:`, data);
      alert(`Expense updated successfully!`);
      location.reload();
    } catch (err) {
      console.error("Error submitting form:", err);
      alert(`Failed to update expense`);
    }
  };

  const handleDelete = async () => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", props.expense.id)
        .select();

      if (error) throw error;

      console.log(`deleted:`, data);
      alert(`Expense deleted successfully!`);
      location.reload();
    } catch (err) {
      console.error("Error submitting form:", err);
      alert(`Failed to delete expense`);
    }
  };
  return (
    <SheetContent side="left">
      <SheetHeader>
        <SheetTitle>Edit Expense</SheetTitle>
      </SheetHeader>

      <SheetDescription className="col-span-4">
        Edit expense or delete it.
      </SheetDescription>
      <div className="grid grid-cols-4 items-center gap-4 mt-4 mb-4">
        <Label className="col-span-2" htmlFor="date">
          Date
        </Label>
        <Input
          id="date"
          name="date"
          type="date"
          className="col-span-2"
          defaultValue={props.expense.expense_date}
          onChange={handleChange}
        />
        <Label className="col-span-2" htmlFor="description">
          Description
        </Label>
        <Input
          id="description"
          name="description"
          className="col-span-4"
          defaultValue={props.expense.description}
          placeholder="Enter description"
          onChange={handleChange}
        />
        <Label htmlFor="paymentmethod" className="col-span-2">
          Payment Method
        </Label>
        <select
          id="paymentmethod"
          name="paymentmethod"
          defaultValue={props.expense.payment_method}
          onChange={handleChange}
          className="col-span-2 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
        >
          <option disabled value="">
            Select a payment method
          </option>
          <option value="credit card">Credit Card</option>
          <option value="debit card">Debit Card</option>
          <option value="cash">Cash</option>
          <option value="bank transfer">Bank Transfer</option>
        </select>
        <Label htmlFor="storeEdit" className="col-span-2">
          Store
        </Label>
        <select
          id="storeEdit"
          name="storeEdit"
          defaultValue={props.expense.stores.id}
          onChange={handleChange}
          className="col-span-2 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
          required
        >
          <option value="">Select a store</option>
          {props.stores &&
            props.stores.map((store: any) => (
              <option key={store.id} value={store.id}>
                {store.store_name}
              </option>
            ))}
        </select>
        <Label className="col-span-2" htmlFor="amountEdit">
          Amount
        </Label>
        <Input
          id="amountEdit"
          name="amount"
          type="number"
          className="col-span-2"
          defaultValue={props.expense.amount}
          placeholder="Enter amount"
          onChange={handleChange}
        />
        <Label className="col-span-2" htmlFor="totalExpenseEdit">
          Total Expense
        </Label>
        <Input
          id="totalExpenseEdit"
          name="total_expense"
          type="number"
          className="col-span-2"
          defaultValue={props.expense.total_expense}
          placeholder="Enter net income"
          onChange={handleChange}
        />
      </div>
      <SheetFooter>
        <SheetClose asChild>
          <Button onClick={handleEdit}>Edit</Button>
        </SheetClose>
        <SheetClose asChild>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  );
}
