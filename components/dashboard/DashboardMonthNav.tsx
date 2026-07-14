"use client";

import { useRouter } from "next/navigation";

const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
];

interface Props {
    selectedMonth: number;
    selectedYear: number;
}

export default function DashboardMonthNav({ selectedMonth, selectedYear }: Props) {
    const router = useRouter();

    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;

    function goPrev() {
        router.push(`/home/dashboard?month=${prevMonth}&year=${prevYear}`);
    }
    function goNext() {
        router.push(`/home/dashboard?month=${nextMonth}&year=${nextYear}`);
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={goPrev}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:border-gray-400 text-paynes-gray hover:text-oxford-blue transition-colors"
                aria-label="Previous month"
            >
                ‹
            </button>
            <span className="text-sm font-medium text-paynes-gray min-w-[140px] text-center">
                {MONTH_NAMES[selectedMonth]} {selectedYear}
            </span>
            <button
                onClick={goNext}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:border-gray-400 text-paynes-gray hover:text-oxford-blue transition-colors"
                aria-label="Next month"
            >
                ›
            </button>
        </div>
    );
}
