"use client";

import { Button } from "@/components/ui/button";

const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
];

interface Props {
    fromMonth: number;
    fromYear:  number;
    onReview:  () => void;
    onDismiss: () => void;
}

export default function SettlementBanner({ fromMonth, fromYear, onReview, onDismiss }: Props) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-6">
            <p className="text-sm text-amber-800">
                You have unreviewed budget differences from{" "}
                <span className="font-semibold">
                    {MONTH_NAMES[fromMonth]} {fromYear}
                </span>
                .
            </p>
            <div className="flex items-center gap-2 shrink-0">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onReview}
                    className="border-amber-300 text-amber-800 hover:bg-amber-100"
                >
                    Review
                </Button>
                <button
                    onClick={onDismiss}
                    className="text-amber-500 hover:text-amber-700 text-lg leading-none"
                    aria-label="Dismiss"
                >
                    ×
                </button>
            </div>
        </div>
    );
}