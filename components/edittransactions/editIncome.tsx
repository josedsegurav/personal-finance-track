import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";


interface FormData {
  description: string;
  gross_income: number;
  net_income: number;
  date: string;
}

export default function EditIncome(props: any) {
  const supabase = createClient();

  const [formData, setFormData] = useState<FormData>({
    description: props.income.description,
    gross_income: props.income.gross_income,
    net_income: props.income.net_income,
    date: props.income.income_date,
  });

  const [editTable, setEditTable] = useState(props.table);

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

  console.log(formData);

  const handleEdit = async () => {
    try {
      const { data, error } = await supabase
        .from("income")
        .update([
          {
            description: formData.description,
            gross_income: formData.gross_income,
            net_income: formData.net_income,
            income_date: formData.date,
          },
        ])
        .eq("id", props.income.id)
        .select();

      if (error) throw error;

      console.log(`Updated:`, data);
      alert(`Income updated successfully!`);
      location.reload();
    } catch (err) {
      console.error("Error submitting form:", err);
      alert(`Failed to update income`);
    }
  };

  const handleDelete = async () => {
    try {
      const { data, error } = await supabase
        .from("income")
        .delete()
        .eq("id", props.income.id)
        .select();

      if (error) throw error;

      console.log(`deleted:`, data);
      alert(`Income deleted successfully!`);
      location.reload();
    } catch (err) {
      console.error("Error submitting form:", err);
      alert(`Failed to delete income`);
    }
  };

  return (
    <SheetContent side="left">
      <SheetHeader>
        <SheetTitle>Edit Income</SheetTitle>
      </SheetHeader>

      <SheetDescription className="col-span-4">
        Edit income or delete it.
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
          defaultValue={props.income.income_date}
          onChange={handleChange}
        />
        <Label className="col-span-2" htmlFor="description">
          Description
        </Label>
        <Input
          id="description"
          name="description"
          className="col-span-4"
          defaultValue={props.income.description}
          placeholder="Enter description"
          onChange={handleChange}
        />
        <Label className="col-span-2" htmlFor="grossIncome">
          Gross Income
        </Label>
        <Input
          id="grossIncome"
          name="gross_income"
          type="number"
          className="col-span-2"
          defaultValue={props.income.gross_income}
          placeholder="Enter gross income"
          onChange={handleChange}
        />
        <Label className="col-span-2" htmlFor="netIncome">
          Net Income
        </Label>
        <Input
          id="netIncome"
          name="net_income"
          type="number"
          className="col-span-2"
          defaultValue={props.income.net_income}
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
