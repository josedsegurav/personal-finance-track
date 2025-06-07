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

interface FormPurchaseData {
  category: string;
  item: string;
  purchaseAmount: string;
  taxes: string;
  notes: string;
}

export default function EditExpense(props: any) {
  const supabase = createClient();
  const [formPurchaseData, setFormPurchaseData] = useState<FormPurchaseData>({
    category: props.purchase.categories.id.toString(),
    item: props.purchase.item,
    purchaseAmount: props.purchase.amount.toString(),
    taxes: "0%",
    notes: props.purchase.notes || "",
  });

  const taxOptions = ["0%", "5%", "12%"];

  const handleChange = (
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

  console.log("formPurchaseData", formPurchaseData);

  const handleEdit = async () => {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .update([
          {
            item: formPurchaseData.item,
            category_id: parseInt(formPurchaseData.category),
            amount: parseFloat(formPurchaseData.purchaseAmount),
            taxes: parseFloat(formPurchaseData.taxes),
            notes: formPurchaseData.notes,
          },
        ])
        .eq("id", props.purchase.id)
        .select();

      if (error) throw error;

      console.log(`Updated:`, data);
      alert(`Purchase updated successfully!`);
      location.reload();
    } catch (err) {
      console.error("Error submitting form:", err);
      alert(`Failed to update purchase`);
    }
  };

  const handleDelete = async () => {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .delete()
        .eq("id", props.purchase.id)
        .select();

      if (error) throw error;

      console.log(`deleted:`, data);
      alert(`Purchase deleted successfully!`);
      location.reload();
    } catch (err) {
      console.error("Error submitting form:", err);
      alert(`Failed to delete purchase`);
    }
  };

  return (
    <SheetContent side="left">
      <SheetHeader>
        <SheetTitle>Edit Purchase</SheetTitle>
      </SheetHeader>

      <SheetDescription className="col-span-4">
        Edit purchase or delete it.
      </SheetDescription>
      <div className="grid grid-cols-4 items-center gap-4 mt-4 mb-4">
        <Label className="col-span-2" htmlFor="item">
          Item Name
        </Label>
        <Input
          id="item"
          name="item"
          className="col-span-4"
          defaultValue={props.purchase.item}
          placeholder="Enter item name"
          onChange={handleChange}
        />
        <Label htmlFor="category" className="col-span-1">
          Category
        </Label>
        <select
          id="category"
          name="category"
          defaultValue={props.purchase.categories.id}
          onChange={handleChange}
          className="col-span-3 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
          required
        >
          <option value="">Select a category</option>
          {props.categories &&
            props.categories.map((category: any) => (
              <option key={category.id} value={category.id}>
                {category.category_name}
              </option>
            ))}
        </select>

        <Label className="col-span-1" htmlFor="amount">
          Amount
        </Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          className="col-span-3"
          defaultValue={props.purchase.amount}
          placeholder="Enter amount"
          onChange={handleChange}
        />
        <Label className="col-span-1" htmlFor="tax">
          Tax Rate
        </Label>
        <select
          id="taxes"
          name="taxes"
          value={formPurchaseData.taxes}
          onChange={handleChange}
          className="col-span-3 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
        >
          {taxOptions.map((tax) => (
            <option key={tax} value={tax}>
              {tax}
            </option>
          ))}
        </select>
        <Label className="col-span-2" htmlFor="notes">
          Notes (Optional)
        </Label>
        <textarea
                      id="notes"
                      name="notes"
                      value={formPurchaseData.notes}
                      onChange={handleChange}
                      className="col-span-4 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                      placeholder="Any additional details about this purchase..."
                      rows={3}
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
