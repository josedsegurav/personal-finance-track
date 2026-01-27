"use client";

import ErrorDisplay from "@/components/errorDisplay";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return <ErrorDisplay title="Error loading the data" error={error} reset={reset} />
}