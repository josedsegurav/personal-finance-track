import { upsertCategoryBudgetAction } from "@/app/budget/actions";
import type { BudgetWithSpent } from "@/app/types";

type BudgetCategoryTableProps = {
  year: number;
  month1to12: number;
  rows: BudgetWithSpent[];
};

export default function BudgetCategoryTable({
  year,
  month1to12,
  rows,
}: BudgetCategoryTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-8 text-center text-paynes-gray shadow-sm">
        <p className="font-medium">No categories yet</p>
        <p className="mt-2 text-sm opacity-70">
          Add categories from Add Data, then set monthly caps here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-x-4 lg:grid lg:grid-cols-4 ">
      {rows.map((row) => {
        const barPct =
          row.percentage && row.percentage != null
            ? Math.min(100, row.percentage * 100)
            : 0;
        const noCapButSpent = !row.percentage && row.spent > 0;

        return (
          <div
            key={row.category_id}
            className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm lg:p-6"
          >
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-paynes-gray">
                  {row.categories?.category_name}
                </h3>
                {noCapButSpent && (
                  <p className="mt-1 text-xs text-amber-600">No cap set</p>
                )}
                {row.percentage > 100 && (
                  <p className="mt-1 text-xs text-bittersweet">Over budget</p>
                )}
              </div>
              <form
                action={upsertCategoryBudgetAction}
                className="flex flex-wrap items-end gap-2"
              >
                <input type="hidden" name="year" value={year} />
                <input type="hidden" name="month" value={month1to12} />
                <input type="hidden" name="categoryId" value={row.category_id} />
                <div>
                  <label className="mb-1 block text-xs text-paynes-gray opacity-80">
                    Monthly cap ($)
                  </label>
                  <input
                    type="number"
                    name="allocated"
                    min={0}
                    step="0.01"
                    placeholder="No cap"
                    defaultValue={
                      row.percentage ? String(row.amount) : undefined
                    }
                    className="w-36 rounded-lg border border-gray-200 px-3 py-2 text-paynes-gray focus:border-columbia-blue focus:outline-none focus:ring-2 focus:ring-columbia-blue/30"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-glaucous px-4 py-2 text-sm font-medium text-white hover:bg-glaucous-dark focus:outline-none focus:ring-2 focus:ring-glaucous"
                >
                  Save
                </button>
              </form>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-xs text-paynes-gray opacity-70">Spent</div>
                <div
                  className={
                    row.percentage > 100
                      ? "text-lg font-semibold text-bittersweet"
                      : "text-lg font-semibold text-paynes-gray"
                  }
                >
                  ${row.spent.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-paynes-gray opacity-70">
                  Remaining
                </div>
                <div
                  className={
                    row.remaining < 0
                      ? "text-lg font-semibold text-bittersweet"
                      : "text-lg font-semibold text-paynes-gray"
                  }
                >
                  {row.percentage ? `$${row.remaining.toFixed(2)}` : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-paynes-gray opacity-70">Used</div>
                <div className="text-lg font-semibold text-paynes-gray">
                  {row.percentage && row.percentage != null
                    ? `${Math.round(row.percentage * 100)}%`
                    : "—"}
                </div>
              </div>
            </div>

            {row.percentage && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    row.percentage > 100 ? "bg-bittersweet" : "bg-columbia-blue"
                  }`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
