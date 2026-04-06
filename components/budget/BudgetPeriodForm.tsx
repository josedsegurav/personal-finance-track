"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type BudgetPeriodFormProps = {
  year: number;
  month1to12: number;
  minYear: number;
  maxYear: number;
};

export default function BudgetPeriodForm({
  year,
  month1to12,
  minYear,
  maxYear,
}: BudgetPeriodFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const years: number[] = [];
  for (let y = minYear; y <= maxYear; y++) years.push(y);

  function apply(y: number, m: number) {
    startTransition(() => {
      router.push(`/home/budget?year=${y}&month=${m}`);
    });
  }

  return (
    <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      <div>
        <label className="mb-1 block text-xs font-medium text-paynes-gray opacity-80">
          Month
        </label>
        <select
          value={month1to12 - 1}
          disabled={pending}
          onChange={(e) => {
            const mi = Number.parseInt(e.target.value, 10);
            apply(year, mi + 1);
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-paynes-gray focus:outline-none focus:ring-2 focus:ring-columbia-blue"
        >
          {MONTHS.map((name, index) => (
            <option key={name} value={index}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-paynes-gray opacity-80">
          Year
        </label>
        <select
          value={year}
          disabled={pending}
          onChange={(e) => {
            const y = Number.parseInt(e.target.value, 10);
            apply(y, month1to12);
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-paynes-gray focus:outline-none focus:ring-2 focus:ring-columbia-blue"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      {pending && (
        <span className="text-xs text-paynes-gray opacity-70">Loading…</span>
      )}
    </div>
  );
}
