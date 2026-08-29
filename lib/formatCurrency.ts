const UNKNOWN_CURRENCY_SYMBOL = "$";

export function formatCurrency(amount: number, currency?: string | null): string {
    if (!currency || currency === "USD") {
        return `$${amount.toFixed(2)}`;
    }

    try {
        const symbol = new Intl.NumberFormat("en", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
            .formatToParts(amount)
            .find((p) => p.type === "currency")?.value;

        return `${symbol ?? UNKNOWN_CURRENCY_SYMBOL}${amount.toFixed(2)}`;
    } catch {
        return `${UNKNOWN_CURRENCY_SYMBOL}${amount.toFixed(2)}`;
    }
}
