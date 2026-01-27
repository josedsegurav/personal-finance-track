"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Pencil } from "lucide-react";
import EditIncome from "./edittransactions/editIncome";
import EditExpense from "./edittransactions/editExpense";
import EditPurchase from "./edittransactions/editPurchase";
import { Category, ExpenseDetailed, Income, PurchaseDetailed, Store } from "@/app/types";

interface EditTransactionProps {
  table: string;
  income: Income;
  expense: ExpenseDetailed;
  stores: Array<Store>;
  categories: Array<Category>;
  purchase: PurchaseDetailed;
}

export default function EditTransaction(props: EditTransactionProps) {
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
