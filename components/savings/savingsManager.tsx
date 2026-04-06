"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    createSavingsAccount,
    upsertSavingsPlan,
    deleteSavingsPlan,
    addContribution,
    deleteContribution,
    archiveSavingsAccount,
} from "@/app/home/savings/actions";
import { SavingsAccountWithPlan } from "@/app/types";

const PALETTE = [
    "#BDD5EA", "#F7A072", "#A8DADC",
    "#B5D5C5", "#E8C5E5", "#F6D860", "#C5B4E3",
];

interface Props {
    accounts: SavingsAccountWithPlan[];
    available: number;
    rawBalance: number;
    currentMonth: number;
    currentYear: number;
}

export default function SavingsManager({
    accounts,
    available,
    rawBalance,
    currentMonth,
    currentYear,
}: Props) {
    const [selectedColor, setSelectedColor] = useState(PALETTE[0]);
    const [expandedAccount, setExpandedAccount] = useState<number | null>(null);
    const [editingPlan, setEditingPlan] = useState<number | null>(null); // account id being plan-edited
    const [contributingTo, setContributingTo] = useState<number | null>(null); // account id

    const today = new Date().toISOString().split("T")[0];

    const totalPlanned = accounts.reduce((s, a) => s + a.plannedAmount, 0);
    const totalContributed = accounts.reduce((s, a) => s + a.totalContributed, 0);

    return (
        <div className="space-y-6">

            {/* ── Action bar ── */}
            <div className="flex flex-wrap gap-3 justify-between items-center">
                <div className="text-sm text-paynes-gray opacity-70 space-x-4">
                    <span>{accounts.length} goal{accounts.length !== 1 ? "s" : ""}</span>
                    <span>·</span>
                    <span>${totalContributed.toFixed(2)} moved this month</span>
                    <span>·</span>
                    <span>${(totalPlanned - totalContributed).toFixed(2)} still to move</span>
                </div>

                {/* New goal sheet */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button>+ New Goal</Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <SheetHeader>
                            <SheetTitle>Create Savings Goal</SheetTitle>
                            <SheetDescription>
                                Give your savings jar a name and optional target amount.
                            </SheetDescription>
                        </SheetHeader>
                        <form action={createSavingsAccount} className="grid gap-4 py-4">
                            <input type="hidden" name="color" value={selectedColor} />

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-sm">Name</Label>
                                <Input
                                    name="name"
                                    placeholder="e.g. Emergency Fund"
                                    className="col-span-3"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-sm">Description</Label>
                                <Input
                                    name="description"
                                    placeholder="Optional"
                                    className="col-span-3"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-sm">Target ($)</Label>
                                <Input
                                    name="goal_amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Leave blank if open-ended"
                                    className="col-span-3"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-sm">Recurring</Label>
                                <div className="col-span-3 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="is_recurring"
                                        value="true"
                                        id="is_recurring"
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="is_recurring" className="text-sm text-paynes-gray opacity-70">
                                        Auto-create plan each month
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-sm">Color</Label>
                                <div className="col-span-3 flex gap-2 flex-wrap">
                                    {PALETTE.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-7 h-7 rounded-full border-2 transition-all ${
                                                selectedColor === color
                                                    ? "border-paynes-gray scale-110"
                                                    : "border-transparent"
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <SheetFooter>
                                <SheetClose asChild>
                                    <Button type="submit">Create Goal</Button>
                                </SheetClose>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            {/* ── Over-allocation warning ── */}
            {available < 0 && (
                <div className="bg-bittersweet bg-opacity-10 border border-bittersweet border-opacity-30 rounded-lg p-4 text-sm text-bittersweet">
                    <strong>Over-allocated by ${Math.abs(available).toFixed(2)}</strong> — your savings plans exceed
                    what&apos;s available after expenses. Reduce one or more plans below to balance.
                </div>
            )}

            {/* ── Savings jar cards ── */}
            {accounts.length === 0 ? (
                <div className="text-center py-16 text-paynes-gray opacity-50">
                    <p className="text-lg font-medium mb-1">No savings goals yet</p>
                    <p className="text-sm">Create your first one above to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map(account => {
                        const isExpanded = expandedAccount === account.id;
                        const isEditingPlan = editingPlan === account.id;
                        const isContributing = contributingTo === account.id;
                        const fullyContributed = account.plannedAmount > 0 &&
                            account.totalContributed >= account.plannedAmount;

                        return (
                            <div
                                key={account.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                            >
                                {/* Color stripe */}
                                <div className="h-2" style={{ backgroundColor: account.color }} />

                                <div className="p-5">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-paynes-gray">
                                                    {account.name}
                                                </h3>
                                                {account.is_recurring && (
                                                    <span className="text-xs bg-columbia-blue bg-opacity-20 text-columbia-blue px-2 py-0.5 rounded-full">
                                                        Recurring
                                                    </span>
                                                )}
                                                {fullyContributed && (
                                                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                                                        ✓ Done
                                                    </span>
                                                )}
                                            </div>
                                            {account.description && (
                                                <p className="text-xs text-paynes-gray opacity-60 mt-0.5">
                                                    {account.description}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => archiveSavingsAccount(account.id)}
                                            className="text-xs text-gray-300 hover:text-bittersweet transition-colors"
                                        >
                                            Archive
                                        </button>
                                    </div>

                                    {/* All-time saved + goal progress */}
                                    <div className="mb-3">
                                        <p className="text-2xl font-semibold text-paynes-gray">
                                            ${account.allTimeSaved.toFixed(2)}
                                        </p>
                                        {account.goal_amount && (
                                            <p className="text-xs text-paynes-gray opacity-60">
                                                of ${account.goal_amount.toFixed(2)} goal
                                            </p>
                                        )}
                                    </div>

                                    {/* Goal progress bar */}
                                    {account.goal_amount && (
                                        <div className="mb-3">
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div
                                                    className="h-1.5 rounded-full transition-all"
                                                    style={{
                                                        width: `${account.progressPercent}%`,
                                                        backgroundColor: account.color,
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-paynes-gray opacity-50 mt-1">
                                                {account.progressPercent.toFixed(0)}% of goal
                                            </p>
                                        </div>
                                    )}

                                    {/* This month plan section */}
                                    <div className="border-t border-gray-100 pt-3 mt-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-medium text-paynes-gray opacity-70">
                                                This month
                                            </span>
                                            <button
                                                onClick={() => setEditingPlan(isEditingPlan ? null : account.id)}
                                                className="text-xs text-columbia-blue hover:opacity-70 transition-opacity"
                                            >
                                                {account.plan
                                                    ? (isEditingPlan ? "Cancel" : "Edit plan")
                                                    : (isEditingPlan ? "Cancel" : "+ Set plan")}
                                            </button>
                                        </div>

                                        {/* Plan amounts */}
                                        {account.plan && !isEditingPlan && (
                                            <div className="space-y-1">
                                                {/* Contribution progress bar */}
                                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                    <div
                                                        className="h-1.5 rounded-full transition-all"
                                                        style={{
                                                            width: `${account.plannedAmount > 0
                                                                ? Math.min((account.totalContributed / account.plannedAmount) * 100, 100)
                                                                : 0}%`,
                                                            backgroundColor: fullyContributed ? "#22c55e" : account.color,
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs text-paynes-gray opacity-60">
                                                    <span>${account.totalContributed.toFixed(2)} moved</span>
                                                    <span>${account.plannedAmount.toFixed(2)} planned</span>
                                                </div>
                                                {account.remaining > 0 && (
                                                    <p className="text-xs text-paynes-gray opacity-50">
                                                        ${account.remaining.toFixed(2)} still to move
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* No plan set */}
                                        {!account.plan && !isEditingPlan && (
                                            <p className="text-xs text-paynes-gray opacity-40 italic">
                                                No plan set for this month
                                            </p>
                                        )}

                                        {/* Inline plan edit form */}
                                        {isEditingPlan && (
                                            <form
                                                action={async (fd) => {
                                                    await upsertSavingsPlan(fd);
                                                    setEditingPlan(null);
                                                }}
                                                className="mt-2 space-y-2"
                                            >
                                                <input type="hidden" name="savings_account_id" value={account.id} />
                                                <input type="hidden" name="month" value={currentMonth} />
                                                <input type="hidden" name="year" value={currentYear} />
                                                {account.plan && (
                                                    <input type="hidden" name="existing_plan_id" value={account.plan.id} />
                                                )}
                                                <div className="flex gap-2">
                                                    <Input
                                                        name="planned_amount"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        defaultValue={account.plan?.planned_amount ?? ""}
                                                        className="flex-1 text-sm h-8"
                                                        required
                                                    />
                                                    <Button type="submit" size="sm" className="h-8 text-xs">
                                                        Save
                                                    </Button>
                                                </div>
                                                {available < 0 && (
                                                    <p className="text-xs text-bittersweet">
                                                        Warning: balance is over-allocated by ${Math.abs(available).toFixed(2)}
                                                    </p>
                                                )}
                                                {account.plan && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            deleteSavingsPlan(account.plan!.id);
                                                            setEditingPlan(null);
                                                        }}
                                                        className="text-xs text-bittersweet hover:opacity-70"
                                                    >
                                                        Remove plan
                                                    </button>
                                                )}
                                            </form>
                                        )}
                                    </div>

                                    {/* Log contribution button */}
                                    {account.plan && !isEditingPlan && (
                                        <div className="mt-3">
                                            <button
                                                onClick={() => setContributingTo(isContributing ? null : account.id)}
                                                className="text-xs text-columbia-blue hover:opacity-70 transition-opacity"
                                            >
                                                {isContributing ? "Cancel" : "Log contribution"}
                                            </button>

                                            {isContributing && (
                                                <form
                                                    action={async (fd) => {
                                                        await addContribution(fd);
                                                        setContributingTo(null);
                                                    }}
                                                    className="mt-2 space-y-2"
                                                >
                                                    <input type="hidden" name="savings_plan_id" value={account.plan!.id} />
                                                    <input type="hidden" name="contribution_date" value={today} />
                                                    <div className="flex gap-2">
                                                        <Input
                                                            name="amount"
                                                            type="number"
                                                            min="0.01"
                                                            step="0.01"
                                                            placeholder={`Max $${account.remaining > 0 ? account.remaining.toFixed(2) : account.plannedAmount.toFixed(2)}`}
                                                            className="flex-1 text-sm h-8"
                                                            required
                                                        />
                                                        <Button type="submit" size="sm" className="h-8 text-xs">
                                                            Log
                                                        </Button>
                                                    </div>
                                                    <Input
                                                        name="note"
                                                        placeholder="Note (optional)"
                                                        className="text-sm h-8"
                                                    />
                                                </form>
                                            )}
                                        </div>
                                    )}

                                    {/* Contribution history toggle */}
                                    {account.contributions.length > 0 && (
                                        <div className="mt-3 border-t border-gray-100 pt-3">
                                            <button
                                                onClick={() => setExpandedAccount(isExpanded ? null : account.id)}
                                                className="text-xs text-paynes-gray opacity-50 hover:opacity-80 transition-opacity"
                                            >
                                                {isExpanded ? "Hide" : "Show"} history ({account.contributions.length})
                                            </button>

                                            {isExpanded && (
                                                <ul className="mt-2 space-y-1">
                                                    {account.contributions.map(c => (
                                                        <li key={c.id} className="flex justify-between items-center text-xs text-paynes-gray">
                                                            <span className="opacity-60">
                                                                {c.contribution_date}
                                                                {c.note && ` · ${c.note}`}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">
                                                                    +${c.amount.toFixed(2)}
                                                                </span>
                                                                <button
                                                                    onClick={() => deleteContribution(c.id)}
                                                                    className="text-gray-300 hover:text-bittersweet transition-colors"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}