import {
  ExpenseDetailed,
  PurchaseDetailed,
  ExpenseInPurchase,
  Store,
  Category,
} from "@/app/types";
import { parseLocalDate } from "./dateUtils";

export interface TransactionFilterState {
  month: string;
  year: string;
  store: string;
  category: string;
  search: string;
}

function unwrapSingle<T>(value: T | T[] | null | undefined): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export function getPurchaseExpense(purchase: PurchaseDetailed): ExpenseInPurchase | undefined {
  const ex = (purchase as unknown as { expenses: unknown }).expenses as unknown;
  if (!ex) return undefined;
  if (Array.isArray(ex)) return ex[0] as unknown as ExpenseInPurchase | undefined;
  return ex as unknown as ExpenseInPurchase;
}

export function getPurchaseStore(purchase: PurchaseDetailed): Store | undefined {
  const exp = getPurchaseExpense(purchase);
  if (!exp) return undefined;
  const stores = (exp as unknown as { stores: unknown }).stores as unknown;
  return unwrapSingle(stores as unknown as Store | Store[]);
}

export function getPurchaseCategory(purchase: PurchaseDetailed): Category | undefined {
  const cat = (purchase as unknown as { categories: unknown }).categories as unknown;
  return unwrapSingle(cat as unknown as Category | Category[]);
}

export function getExpenseStore(expense: ExpenseDetailed): Store | undefined {
  const s = (expense as unknown as { stores: unknown }).stores as unknown;
  return unwrapSingle(s as unknown as Store | Store[]);
}

export function matchesSearch(
  haystack: Array<string | null | undefined>,
  query: string
): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return haystack.some((v) => (v ?? "").toLowerCase().includes(q));
}

export function filterExpenses(
  expenses: ExpenseDetailed[],
  f: TransactionFilterState
): ExpenseDetailed[] {
  return expenses.filter((e) => {
    const d = parseLocalDate(e.expense_date);
    if (f.year !== "all" && d.getFullYear() !== Number(f.year)) return false;
    const store = getExpenseStore(e);
    if (f.store !== "all" && String(store?.id) !== f.store) return false;
    if (!matchesSearch([e.description, store?.store_name, e.payment_method], f.search))
      return false;
    return true;
  });
}

export function filterPurchases(
  purchases: PurchaseDetailed[],
  f: TransactionFilterState
): PurchaseDetailed[] {
  return purchases.filter((p) => {
    const expenseInfo = getPurchaseExpense(p);
    // Orphan purchases have no parent expense — show them in Purchases tab,
    // hidden from grouped views. Skip date/store filtering, keep category/search.
    if (!expenseInfo) {
      if (f.category !== "all" && String(getPurchaseCategory(p)?.id) !== f.category) return false;
      if (!matchesSearch([p.item, getPurchaseCategory(p)?.category_name, p.notes], f.search))
        return false;
      return true;
    }
    const rawDate = (expenseInfo as unknown as { expense_date: string }).expense_date;
    if (!rawDate) return false;
    const d = parseLocalDate(String(rawDate));
    if (f.year !== "all" && d.getFullYear() !== Number(f.year)) return false;
    if (f.month !== "all" && d.getMonth() !== Number(f.month)) return false;
    if (f.store !== "all" && String(getPurchaseStore(p)?.id) !== f.store) return false;
    if (f.category !== "all" && String(getPurchaseCategory(p)?.id) !== f.category) return false;
    if (!matchesSearch([p.item, getPurchaseCategory(p)?.category_name, p.notes], f.search))
      return false;
    return true;
  });
}

export function groupPurchasesByExpenseId(
  purchases: PurchaseDetailed[]
): Map<number, PurchaseDetailed[]> {
  const map = new Map<number, PurchaseDetailed[]>();
  for (const p of purchases) {
    const exp = getPurchaseExpense(p);
    if (!exp?.id) continue; // orphan purchases skip grouping — shown flat in Purchases tab
    const id = exp.id;
    if (!map.has(id)) map.set(id, []);
    map.get(id)!.push(p);
  }
  return map;
}

export interface GroupedExpense {
  expense: ExpenseDetailed;
  purchases: PurchaseDetailed[];
  totalPurchaseCount: number;
}

export function buildGroupedExpenses(
  filteredExpenses: ExpenseDetailed[],
  allPurchasesByExpenseId: Map<number, PurchaseDetailed[]>,
  f: TransactionFilterState
): GroupedExpense[] {
  const narrowingActive = f.category !== "all" || f.search.trim() !== "";
  const result: GroupedExpense[] = [];

  for (const expense of filteredExpenses) {
    const allChildPurchases = allPurchasesByExpenseId.get(expense.id) ?? [];
    const totalPurchaseCount = allChildPurchases.length;

    if (!narrowingActive) {
      result.push({ expense, purchases: allChildPurchases, totalPurchaseCount });
      continue;
    }

    const matchingPurchases = allChildPurchases.filter((p) => {
      if (f.category !== "all" && String(getPurchaseCategory(p)?.id) !== f.category) return false;
      if (f.search.trim() && !matchesSearch([p.item, getPurchaseCategory(p)?.category_name, p.notes], f.search))
        return false;
      return true;
    });

    const expenseMatchesSearch =
      f.search.trim() !== "" &&
      matchesSearch([expense.description, getExpenseStore(expense)?.store_name, expense.payment_method], f.search);

    if (f.category === "all" && expenseMatchesSearch) {
      result.push({ expense, purchases: allChildPurchases, totalPurchaseCount });
    } else if (matchingPurchases.length > 0) {
      result.push({ expense, purchases: matchingPurchases, totalPurchaseCount });
    }
  }

  return result;
}