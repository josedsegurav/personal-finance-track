export interface AmortizationRow {
    due_date: string;
    capital: number;
    interest: number;
    total_payment: number;
    balance_after: number;
}

/**
 * Generate a French (fixed-payment) amortization schedule.
 * Each monthly payment is equal; interest portion declines, capital portion rises.
 */
export function generateFrenchSchedule(
    principal: number,
    annualRatePercent: number,
    termMonths: number,
    startDate: Date
): AmortizationRow[] {
    const i = annualRatePercent / 100 / 12;
    const n = termMonths;

    const monthlyPayment = (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);

    const rows: AmortizationRow[] = [];
    let balance = principal;

    for (let m = 1; m <= n; m++) {
        const interest = balance * i;
        const capital = monthlyPayment - interest;
        balance = Math.max(0, balance - capital);

        const due = new Date(startDate);
        due.setMonth(due.getMonth() + m);

        const y = due.getFullYear();
        const mo = String(due.getMonth() + 1).padStart(2, "0");
        const d = String(due.getDate()).padStart(2, "0");

        rows.push({
            due_date: `${y}-${mo}-${d}`,
            capital: round(capital),
            interest: round(interest),
            total_payment: round(monthlyPayment),
            balance_after: round(balance),
        });
    }

    return rows;
}

/**
 * Generate a German (declining-payment) amortization schedule.
 * Capital portion is fixed each month; total payment declines as interest drops.
 */
export function generateGermanSchedule(
    principal: number,
    annualRatePercent: number,
    termMonths: number,
    startDate: Date
): AmortizationRow[] {
    const i = annualRatePercent / 100 / 12;
    const n = termMonths;
    const fixedCapital = principal / n;

    const rows: AmortizationRow[] = [];
    let balance = principal;

    for (let m = 1; m <= n; m++) {
        const interest = balance * i;
        const capital = m < n ? fixedCapital : balance;
        const total = capital + interest;
        balance = Math.max(0, balance - capital);

        const due = new Date(startDate);
        due.setMonth(due.getMonth() + m);

        const y = due.getFullYear();
        const mo = String(due.getMonth() + 1).padStart(2, "0");
        const d = String(due.getDate()).padStart(2, "0");

        rows.push({
            due_date: `${y}-${mo}-${d}`,
            capital: round(capital),
            interest: round(interest),
            total_payment: round(total),
            balance_after: round(balance),
        });
    }

    return rows;
}

/**
 * Generate an amortization schedule, auto-detecting French vs German
 * based on a heuristic. Defaults to French (more common worldwide).
 */
export function generateAmortizationSchedule(
    principal: number,
    annualRatePercent: number,
    termMonths: number,
    startDate: Date,
    system?: "french" | "german"
): AmortizationRow[] {
    if (system === "german") {
        return generateGermanSchedule(principal, annualRatePercent, termMonths, startDate);
    }
    return generateFrenchSchedule(principal, annualRatePercent, termMonths, startDate);
}

/**
 * Detect amortization system from extracted payment rows.
 * - French: total_payment is approximately constant across rows
 * - German: total_payment declines (fixed capital, decreasing interest)
 * - unknown: too few rows or ambiguous
 */
export function detectAmortizationSystem(
    rows: { total_payment?: number | null }[]
): "french" | "german" | "unknown" {
    const valid = rows.filter((r) => r.total_payment != null && r.total_payment > 0);

    if (valid.length < 3) return "unknown";

    const payments = valid.map((r) => r.total_payment!);
    const first = payments[0];
    const last = payments[payments.length - 1];

    const ratio = last / first;

    // French: payments stay within ~1% of each other (tiny rounding diff)
    // German: last payment is significantly smaller than first
    if (ratio >= 0.95) return "french";
    if (ratio <= 0.85) return "german";
    return "unknown";
}

function round(n: number): number {
    return Math.round(n * 100) / 100;
}
