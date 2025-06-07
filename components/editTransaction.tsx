"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Pencil } from "lucide-react";
import EditIncome from "./edittransactions/editIncome";
import EditExpense from "./edittransactions/editExpense";
import EditPurchase from "./edittransactions/editPurchase";

export default function EditTransaction(props: any) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="mt-4" variant="outline">
          <Pencil size={18} />
        </Button>
      </SheetTrigger>
      {props.table === "income" && <EditIncome income={props.income} />}
      {props.table === "expense" && <EditExpense expense={props.expense} stores={props.stores} />}
      {props.table === "purchase" && <EditPurchase purchase={props.purchase} categories={props.categories} stores={props.stores} />}
    </Sheet>
  );
}
