"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet, SheetClose, SheetContent, SheetDescription,
    SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { upsertBudget, deleteBudget } from "@/app/home/budget/actions";
import { BudgetWithSpent, Category } from "@/app/types";

interface Props {
    budgets: BudgetWithSpent[];
    categories: Category[];
    currentMonth: number;
    currentYear: number;
}

export default function BudgetManager({ budgets, categories, currentMonth, currentYear }: Props) {
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [amount, setAmount] = useState("");

    const budgetedCategoryIds = new Set(budgets.map((b) => b.category_id));
    const availableCategories = categories.filter((c) => !budgetedCategoryIds.has(c.id));

    return (
        <div className="space-y-6">
            {/* Add Budget Sheet */}
            <div className="flex justify-end">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline">+ Add Budget</Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <SheetHeader>
                            <SheetTitle>Set Category Budget</SheetTitle>
                            <SheetDescription>
                                Allocate a spending limit for a category this month.
                            </SheetDescription>
                        </SheetHeader>
                        <form action={upsertBudget} className="grid gap-4 py-4">
                            <input type="hidden" name="month" value={currentMonth} />
                            <input type="hidden" name="year" value={currentYear} />
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Category</Label>
                                <select
                                    name="category_id"
                                    value={selectedCategoryId}
                                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                                    className="col-span-3 px-4 py-2 border border-gray-200 rounded-lg"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {availableCategories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.category_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Amount ($)</Label>
                                <Input
                                    name="amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <SheetFooter>
                                <SheetClose asChild>
                                    <Button type="submit">Save Budget</Button>
                                </SheetClose>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Budget Cards */}
            {budgets.length === 0 ? (
                <p className="text-center text-paynes-gray opacity-60 py-12">
                    No budgets set for this month. Add one above.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {budgets.map((budget) => (
                        <div key={budget.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-paynes-gray">
                                    {(budget.categories as unknown as Category)?.category_name ?? `Category ${budget.category_id}`}
                                </h3>
                                <button
                                    onClick={() => deleteBudget(budget.id)}
                                    className="text-xs text-gray-400 hover:text-bittersweet transition-colors"
                                >
                                    Remove
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div
                                    className={`h-2.5 rounded-full transition-all ${
                                        budget.percentage >= 100 ? "bg-bittersweet" :
                                        budget.percentage >= 80 ? "bg-yellow-400" :
                                        "bg-columbia-blue"
                                    }`}
                                    style={{ width: `${budget.percentage}%` }}
                                />
                            </div>

                            <div className="flex justify-between text-xs text-paynes-gray opacity-70">
                                <span>${budget.spent.toFixed(2)} spent</span>
                                <span>${budget.amount.toFixed(2)} budgeted</span>
                            </div>

                            <p className={`text-sm font-medium ${budget.remaining >= 0 ? "text-columbia-blue" : "text-bittersweet"}`}>
                                {budget.remaining >= 0
                                    ? `$${budget.remaining.toFixed(2)} remaining`
                                    : `$${Math.abs(budget.remaining).toFixed(2)} over budget`}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}