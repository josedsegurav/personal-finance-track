import type {
  Category,
  CategoryBudgetRow,
  CategoryBudgetStatus,
  Income,
  Expense,
} from "@/app/types";

/** Purchase row shape from getPurchases (nested relations may be object or single-element array). */
export type PurchaseForBudget = {
  categories:
    | { id: number; category_name: string }
    | Array<{ id: number; category_name: string }>;
  amount: number;
  taxes: number;
  expenses:
    | { expense_date: string }
    | Array<{ expense_date: string }>
    | null;
};

function normalizeCategory(
  purchase: PurchaseForBudget
): { id: number; category_name: string } | null {
  const c = purchase.categories;
  if (!c) return null;
  return Array.isArray(c) ? c[0] ?? null : c;
}

function getLinkedExpenseDate(
  purchase: PurchaseForBudget
): string | null {
  const ex = purchase.expenses;
  if (!ex) return null;
  const row = Array.isArray(ex) ? ex[0] : ex;
  return row?.expense_date ?? null;
}

/**
 * Total for one purchase line, matching components/purchases/chart.tsx and card display:
 * amount + (taxes/100)*amount
 */
export function purchaseLineTotal(amount: number, taxes: number): number {
  return amount + (taxes / 100) * amount;
}

/**
 * Whether the purchase falls in the given calendar month (local timezone),
 * aligned with app/home/dashboard income and expense month boundaries.
 */
export function purchaseInLocalMonth(
  purchase: PurchaseForBudget,
  year: number,
  month1to12: number
): boolean {
  const raw = getLinkedExpenseDate(purchase);
  if (!raw) return false;
  const d = new Date(raw);
  return (
    d.getFullYear() === year && d.getMonth() === month1to12Index(month1to12)
  );
}

function month1to12Index(month1to12: number): number {
  return month1to12 - 1;
}

/**
 * Spent per category id from purchases in the period. Uncategorized purchase flows are excluded if expense_date is missing.
 */
export function spentByCategoryIdForMonth(
  purchases: PurchaseForBudget[] | null,
  year: number,
  month1to12: number
): Map<number, number> {
  const map = new Map<number, number>();
  if (!purchases?.length) return map;

  for (const p of purchases) {
    if (!purchaseInLocalMonth(p, year, month1to12)) continue;
    const cat = normalizeCategory(p);
    const id = cat?.id;
    if (id == null) continue;
    const add = purchaseLineTotal(Number(p.amount), Number(p.taxes));
    map.set(id, (map.get(id) ?? 0) + add);
  }
  return map;
}

function budgetRowMap(
  rows: CategoryBudgetRow[] | null
): Map<number, CategoryBudgetRow> {
  const m = new Map<number, CategoryBudgetRow>();
  if (!rows) return m;
  for (const r of rows) {
    m.set(r.category_id, r);
  }
  return m;
}

export function mergeCategoryBudgetStatus(
  categories: Category[] | null,
  budgetRows: CategoryBudgetRow[] | null,
  spentByCategory: Map<number, number>
): CategoryBudgetStatus[] {
  if (!categories?.length) return [];

  const rows = budgetRowMap(budgetRows);

  return categories.map((cat) => {
    const row = rows.get(cat.id);
    const allocated = row ? Number(row.allocated_amount) : 0;
    const spent = spentByCategory.get(cat.id) ?? 0;
    const hasCap = row != null && allocated > 0;
    const remaining = allocated - spent;
    const pctUsed =
      hasCap && allocated > 0 ? spent / allocated : null;
    const overBudget = hasCap && spent > allocated;

    return {
      categoryId: cat.id,
      categoryName: cat.category_name,
      budgetRowId: row?.id ?? null,
      allocated,
      spent,
      remaining,
      pctUsed,
      overBudget,
      hasCap,
    };
  });
}

export function totalMonthlyNetIncome(
  income: Income[] | null,
  year: number,
  month1to12: number
): number {
  if (!income?.length) return 0;
  const mi = month1to12Index(month1to12);
  return income.reduce((sum, row) => {
    const d = new Date(row.income_date);
    if (d.getFullYear() !== year || d.getMonth() !== mi) return sum;
    return sum + parseFloat(String(row.net_income));
  }, 0);
}

export function totalMonthlyExpenses(
  expenses: Expense[] | null,
  year: number,
  month1to12: number
): number {
  if (!expenses?.length) return 0;
  const mi = month1to12Index(month1to12);
  return expenses.reduce((sum, row) => {
    const d = new Date(row.expense_date);
    if (d.getFullYear() !== year || d.getMonth() !== mi) return sum;
    return sum + parseFloat(String(row.total_expense));
  }, 0);
}
