"use client";

import { useState, useTransition } from "react";
import { submitOnboarding, OnboardingBudget, OnboardingSavings } from "@/app/home/onboarding/actions";

/* ─── Constants ──────────────────────────────────────────────────────────── */

const CATEGORY_SUGGESTIONS = [
    "Food & Groceries",
    "Transport",
    "Utilities",
    "Health",
    "Entertainment",
    "Shopping",
    "Dining Out",
    "Education",
];

const STORE_SUGGESTIONS = [
    "Supermarket",
    "Online",
    "Restaurant",
    "Pharmacy",
    "Gas Station",
    "Convenience Store",
];

const SAVINGS_COLORS = [
    "#577399", "#BDD5EA", "#22c55e", "#f59e0b",
    "#a78bfa", "#f97316", "#14b8a6", "#ec4899",
];

const STEPS = ["Categories", "Stores", "Budget", "Savings"] as const;
type StepIndex = 0 | 1 | 2 | 3;

/* ─── Small shared components ────────────────────────────────────────────── */

function ProgressBar({ current }: { current: StepIndex }) {
    return (
        <div className="flex items-center justify-center gap-0 mb-10">
            {STEPS.map((label, i) => {
                const done    = i < current;
                const active  = i === current;
                const future  = i > current;
                const isLast  = i === STEPS.length - 1;

                return (
                    <div key={label} className="flex items-center">
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors
                                    ${done   ? "bg-glaucous text-white"
                                    : active ? "bg-glaucous text-white ring-4 ring-columbia-blue ring-opacity-30"
                                    :          "bg-gray-100 text-gray-400"}`}
                            >
                                {done ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    i + 1
                                )}
                            </div>
                            <span className={`text-xs font-medium whitespace-nowrap ${active ? "text-glaucous" : future ? "text-gray-400" : "text-paynes-gray"}`}>
                                {label}
                            </span>
                        </div>
                        {!isLast && (
                            <div className={`w-16 h-0.5 mb-5 mx-1 ${i < current ? "bg-glaucous" : "bg-gray-200"}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function Chip({ label, onAdd }: { label: string; onAdd: (v: string) => void }) {
    return (
        <button
            type="button"
            onClick={() => onAdd(label)}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-paynes-gray rounded-full hover:bg-columbia-blue hover:text-white transition-colors"
        >
            + {label}
        </button>
    );
}

function ItemList({
    items,
    onRemove,
}: {
    items: string[];
    onRemove: (i: number) => void;
}) {
    if (items.length === 0) return null;
    return (
        <ul className="space-y-2 mb-4">
            {items.map((item, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-sm text-paynes-gray">{item}</span>
                    <button
                        type="button"
                        onClick={() => onRemove(i)}
                        className="text-gray-300 hover:text-red-400 transition-colors ml-3"
                        aria-label="Remove"
                    >
                        ✕
                    </button>
                </li>
            ))}
        </ul>
    );
}

function AddInput({
    placeholder,
    onAdd,
}: {
    placeholder: string;
    onAdd: (v: string) => void;
}) {
    const [value, setValue] = useState("");

    const commit = () => {
        const t = value.trim();
        if (!t) return;
        onAdd(t);
        setValue("");
    };

    return (
        <div className="flex gap-2">
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
                placeholder={placeholder}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
            />
            <button
                type="button"
                onClick={commit}
                disabled={!value.trim()}
                className="px-4 py-2.5 text-sm font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Add
            </button>
        </div>
    );
}

/* ─── Step 1: Categories ─────────────────────────────────────────────────── */

function StepCategories({
    items,
    onAdd,
    onRemove,
    onNext,
}: {
    items: string[];
    onAdd: (v: string) => void;
    onRemove: (i: number) => void;
    onNext: () => void;
}) {
    const suggestions = CATEGORY_SUGGESTIONS.filter((s) => !items.includes(s));

    return (
        <div>
            <h2 className="text-lg font-semibold text-paynes-gray mb-1">Set up your categories</h2>
            <p className="text-sm text-paynes-gray opacity-60 mb-6">
                Categories group your purchases — like Food, Transport, or Health. Add at least one to continue.
            </p>

            <ItemList items={items} onRemove={onRemove} />
            <AddInput placeholder="Type a category name…" onAdd={onAdd} />

            {suggestions.length > 0 && (
                <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">Suggestions</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((s) => <Chip key={s} label={s} onAdd={onAdd} />)}
                    </div>
                </div>
            )}

            <div className="flex justify-end mt-8">
                <button
                    type="button"
                    onClick={onNext}
                    disabled={items.length === 0}
                    className="px-6 py-2.5 font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}

/* ─── Step 2: Stores ─────────────────────────────────────────────────────── */

function StepStores({
    items,
    onAdd,
    onRemove,
    onNext,
    onBack,
}: {
    items: string[];
    onAdd: (v: string) => void;
    onRemove: (i: number) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    const suggestions = STORE_SUGGESTIONS.filter((s) => !items.includes(s));

    return (
        <div>
            <h2 className="text-lg font-semibold text-paynes-gray mb-1">Add your stores</h2>
            <p className="text-sm text-paynes-gray opacity-60 mb-6">
                Stores are where you spend — supermarkets, restaurants, online shops. Add at least one to continue.
            </p>

            <ItemList items={items} onRemove={onRemove} />
            <AddInput placeholder="Type a store name…" onAdd={onAdd} />

            {suggestions.length > 0 && (
                <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">Suggestions</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((s) => <Chip key={s} label={s} onAdd={onAdd} />)}
                    </div>
                </div>
            )}

            <div className="flex justify-between mt-8">
                <button type="button" onClick={onBack} className="px-6 py-2.5 font-medium text-paynes-gray hover:bg-gray-100 rounded-lg transition-colors">
                    ← Back
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    disabled={items.length === 0}
                    className="px-6 py-2.5 font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}

/* ─── Step 3: Budget ─────────────────────────────────────────────────────── */

function StepBudget({
    categories,
    budgets,
    onChange,
    onNext,
    onSkip,
    onBack,
}: {
    categories: string[];
    budgets: Record<string, string>;
    onChange: (cat: string, val: string) => void;
    onNext: () => void;
    onSkip: () => void;
    onBack: () => void;
}) {
    const hasAny = Object.values(budgets).some((v) => parseFloat(v) > 0);

    return (
        <div>
            <h2 className="text-lg font-semibold text-paynes-gray mb-1">Set monthly budgets</h2>
            <p className="text-sm text-paynes-gray opacity-60 mb-6">
                Optionally set a spending limit for each category. Leave blank to skip any you&apos;re not sure about — you can always add them later.
            </p>

            <div className="space-y-3">
                {categories.map((cat) => (
                    <div key={cat} className="flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="flex-1 text-sm text-paynes-gray">{cat}</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm text-gray-400">$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={budgets[cat] ?? ""}
                                onChange={(e) => onChange(cat, e.target.value)}
                                placeholder="0.00"
                                className="w-28 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent text-right"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center mt-8">
                <button type="button" onClick={onBack} className="px-6 py-2.5 font-medium text-paynes-gray hover:bg-gray-100 rounded-lg transition-colors">
                    ← Back
                </button>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={onSkip} className="text-sm text-gray-400 hover:text-paynes-gray transition-colors">
                        Skip for now
                    </button>
                    <button
                        type="button"
                        onClick={onNext}
                        disabled={!hasAny}
                        className="px-6 py-2.5 font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Next →
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Step 4: Savings ────────────────────────────────────────────────────── */

function StepSavings({
    goals,
    onAdd,
    onRemove,
    onChange,
    onFinish,
    onSkip,
    onBack,
    submitting,
    error,
}: {
    goals: OnboardingSavings[];
    onAdd: () => void;
    onRemove: (i: number) => void;
    onChange: (i: number, field: keyof OnboardingSavings, val: string) => void;
    onFinish: () => void;
    onSkip: () => void;
    onBack: () => void;
    submitting: boolean;
    error: string;
}) {
    const hasValid = goals.some((g) => g.name.trim() !== "");

    return (
        <div>
            <h2 className="text-lg font-semibold text-paynes-gray mb-1">Create savings goals</h2>
            <p className="text-sm text-paynes-gray opacity-60 mb-6">
                Savings goals help you set aside money each month. Give each one a name and an optional target. You can add more later.
            </p>

            <div className="space-y-4">
                {goals.map((goal, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-paynes-gray opacity-60 uppercase tracking-wide">Goal {i + 1}</span>
                            {goals.length > 1 && (
                                <button type="button" onClick={() => onRemove(i)} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Name */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-paynes-gray mb-1">Goal name</label>
                                <input
                                    type="text"
                                    value={goal.name}
                                    onChange={(e) => onChange(i, "name", e.target.value)}
                                    placeholder="e.g. Emergency fund, Vacation…"
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                                />
                            </div>

                            {/* Target amount */}
                            <div>
                                <label className="block text-xs font-medium text-paynes-gray mb-1">Target amount (optional)</label>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm text-gray-400">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={goal.goalAmount}
                                        onChange={(e) => onChange(i, "goalAmount", e.target.value)}
                                        placeholder="0.00"
                                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-xs font-medium text-paynes-gray mb-1">Color</label>
                                <div className="flex gap-2 flex-wrap pt-1">
                                    {SAVINGS_COLORS.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => onChange(i, "color", c)}
                                            className={`w-6 h-6 rounded-full transition-transform ${goal.color === c ? "scale-125 ring-2 ring-offset-1 ring-gray-400" : "hover:scale-110"}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={onAdd}
                className="mt-4 w-full py-2.5 text-sm font-medium text-glaucous border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
                + Add another goal
            </button>

            {error && (
                <p className="mt-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    {error}
                </p>
            )}

            <div className="flex justify-between items-center mt-8">
                <button type="button" onClick={onBack} className="px-6 py-2.5 font-medium text-paynes-gray hover:bg-gray-100 rounded-lg transition-colors">
                    ← Back
                </button>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={onSkip} disabled={submitting} className="text-sm text-gray-400 hover:text-paynes-gray transition-colors disabled:opacity-40">
                        Skip for now
                    </button>
                    <button
                        type="button"
                        onClick={onFinish}
                        disabled={!hasValid || submitting}
                        className="px-6 py-2.5 font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Saving…" : "Finish →"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main wizard ────────────────────────────────────────────────────────── */

const EMPTY_GOAL: OnboardingSavings = { name: "", goalAmount: "", color: SAVINGS_COLORS[0] };

export default function OnboardingWizard() {
    const [step, setStep]           = useState<StepIndex>(0);
    const [categories, setCategories] = useState<string[]>([]);
    const [stores, setStores]       = useState<string[]>([]);
    const [budgets, setBudgets]     = useState<Record<string, string>>({});
    const [goals, setGoals]         = useState<OnboardingSavings[]>([{ ...EMPTY_GOAL }]);
    const [error, setError]         = useState("");
    const [isPending, startTransition] = useTransition();

    /* ── List helpers ── */
    const addUnique = (list: string[], setList: (v: string[]) => void) => (val: string) => {
        if (!list.includes(val)) setList([...list, val]);
    };
    const removeAt = (list: string[], setList: (v: string[]) => void) => (i: number) => {
        setList(list.filter((_, idx) => idx !== i));
    };

    /* ── Budget helpers ── */
    const handleBudgetChange = (cat: string, val: string) =>
        setBudgets((prev) => ({ ...prev, [cat]: val }));

    /* ── Goal helpers ── */
    const handleGoalChange = (i: number, field: keyof OnboardingSavings, val: string) =>
        setGoals((prev) => prev.map((g, idx) => idx === i ? { ...g, [field]: val } : g));

    const addGoal = () => setGoals((prev) => [...prev, { ...EMPTY_GOAL }]);

    const removeGoal = (i: number) => setGoals((prev) => prev.filter((_, idx) => idx !== i));

    /* ── Submit ── */
    const submit = (includeSavings: boolean) => {
        setError("");
        startTransition(async () => {
            try {
                const budgetPayload: OnboardingBudget[] = Object.entries(budgets)
                    .map(([categoryName, val]) => ({ categoryName, amount: parseFloat(val) || 0 }))
                    .filter((b) => b.amount > 0);

                const savingsPayload = includeSavings
                    ? goals.filter((g) => g.name.trim() !== "")
                    : [];

                await submitOnboarding({
                    categories,
                    stores,
                    budgets: budgetPayload,
                    savings: savingsPayload,
                });
            } catch (e) {
                setError((e as Error).message ?? "Something went wrong. Please try again.");
            }
        });
    };

    return (
        <div className="min-h-screen bg-ghost-white flex items-start justify-center pt-12 px-4 pb-12">
            <div className="w-full max-w-xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold text-paynes-gray mb-2">Welcome! Let&apos;s get you set up.</h1>
                    <p className="text-sm text-paynes-gray opacity-60">
                        This takes about 2 minutes. You can change everything later.
                    </p>
                </div>

                <ProgressBar current={step} />

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                    {step === 0 && (
                        <StepCategories
                            items={categories}
                            onAdd={addUnique(categories, setCategories)}
                            onRemove={removeAt(categories, setCategories)}
                            onNext={() => setStep(1)}
                        />
                    )}
                    {step === 1 && (
                        <StepStores
                            items={stores}
                            onAdd={addUnique(stores, setStores)}
                            onRemove={removeAt(stores, setStores)}
                            onNext={() => setStep(2)}
                            onBack={() => setStep(0)}
                        />
                    )}
                    {step === 2 && (
                        <StepBudget
                            categories={categories}
                            budgets={budgets}
                            onChange={handleBudgetChange}
                            onNext={() => setStep(3)}
                            onSkip={() => setStep(3)}
                            onBack={() => setStep(1)}
                        />
                    )}
                    {step === 3 && (
                        <StepSavings
                            goals={goals}
                            onAdd={addGoal}
                            onRemove={removeGoal}
                            onChange={handleGoalChange}
                            onFinish={() => submit(true)}
                            onSkip={() => submit(false)}
                            onBack={() => setStep(2)}
                            submitting={isPending}
                            error={error}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}