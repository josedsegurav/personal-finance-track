export interface ScenarioInput {
    principal: number;
    annualRatePercent: number;
    termMonths: number;
    startDate: string;
    extraMonthly: number;
    lumpSum: number;
    lumpSumDate: string | null;
    strategy: "reduce_term" | "reduce_payment";
}

export interface ScenarioResult {
    baselineMonths: number;
    baselineTotalInterest: number;
    scenarioMonths: number;
    scenarioTotalInterest: number;
    monthsSaved: number;
    interestSaved: number;
    payoffDate: string | null;
    baselineSchedule: { month: number; balance: number }[];
    scenarioSchedule: { month: number; balance: number }[];
}

function parseLocalDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function calculateScenario(input: ScenarioInput): ScenarioResult {
    const i = input.annualRatePercent / 100 / 12;
    const n = input.termMonths;
    const start = parseLocalDate(input.startDate);

    // Baseline: standard French amortization (most common)
    const baselinePayment =
        i > 0
            ? (input.principal * i * Math.pow(1 + i, n)) /
              (Math.pow(1 + i, n) - 1)
            : input.principal / n;

    const baselineSchedule: { month: number; balance: number }[] = [];
    let blBalance = input.principal;
    let blTotalInterest = 0;

    for (let m = 1; m <= n; m++) {
        if (blBalance <= 0) break;
        const interest = blBalance * i;
        const capital = Math.min(baselinePayment - interest, blBalance);
        blBalance -= capital;
        blTotalInterest += interest;
        baselineSchedule.push({ month: m, balance: Math.max(0, blBalance) });
    }

    // Scenario:
    const lumpSumMonth = input.lumpSumDate
        ? Math.round(
              (parseLocalDate(input.lumpSumDate).getTime() - start.getTime()) /
                  (30.44 * 24 * 60 * 60 * 1000)
          ) + 1
        : null;

    const effectiveMonthly =
        input.strategy === "reduce_term"
            ? baselinePayment + input.extraMonthly
            : baselinePayment + input.extraMonthly;

    const scenarioSchedule: { month: number; balance: number }[] = [];
    let scBalance = input.principal;
    let scTotalInterest = 0;
    let scMonths = 0;
    const maxMonths = n * 2; // safety limit

    for (let m = 1; m <= maxMonths; m++) {
        if (scBalance <= 0) break;

        const interest = scBalance * i;
        let capital: number;

        if (input.strategy === "reduce_term") {
            // Fixed payment level, pay off sooner
            capital = effectiveMonthly - interest;
        } else {
            // Fixed term, recalculate payment to fit remaining months
            const remainingMonths = n - m + 1;
            if (i > 0 && remainingMonths > 0) {
                capital = (scBalance * i * Math.pow(1 + i, remainingMonths)) /
                    (Math.pow(1 + i, remainingMonths) - 1) - interest;
            } else {
                capital = scBalance / Math.max(1, remainingMonths);
            }
        }

        // Apply lump sum
        let lumpHere = 0;
        if (lumpSumMonth && m === lumpSumMonth) {
            lumpHere = input.lumpSum;
        }

        capital = Math.min(capital + lumpHere, scBalance + interest);
        scBalance -= capital;
        scTotalInterest += interest;
        scMonths = m;

        scenarioSchedule.push({ month: m, balance: Math.max(0, scBalance) });
    }

    const monthsSaved = baselineSchedule.length - scMonths;
    const interestSaved = blTotalInterest - scTotalInterest;

    const payoffDate =
        scMonths > 0
            ? formatDate(new Date(start.getFullYear(), start.getMonth() + scMonths, start.getDate()))
            : null;

    return {
        baselineMonths: baselineSchedule.length,
        baselineTotalInterest: blTotalInterest,
        scenarioMonths: scMonths,
        scenarioTotalInterest: scTotalInterest,
        monthsSaved: Math.max(0, monthsSaved),
        interestSaved: Math.max(0, interestSaved),
        payoffDate,
        baselineSchedule,
        scenarioSchedule,
    };
}
