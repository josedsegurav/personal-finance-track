"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SidebarNav from "@/components/sidebar";
import ScheduleGrid from "@/components/loans/ScheduleGrid";
import { createLoanWithSchedule } from "@/app/home/loans/actions";
import InlineNotification from "@/components/ui/InlineNotification";
import type { LoanDocumentUnderstanding, LoanExtractionResult, LoanScheduledPayment } from "@/app/types";

type Step = "upload" | "review";

export default function ImportLoanPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<Step>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [pass1, setPass1] = useState<LoanDocumentUnderstanding | null>(null);
    const [extraction, setExtraction] = useState<LoanExtractionResult | null>(null);
    const [scheduleRows, setScheduleRows] = useState<Partial<LoanScheduledPayment>[]>([]);
    const [requiresManualInput, setRequiresManualInput] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [pass2Progress, setPass2Progress] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Editable loan fields
    const [loanName, setLoanName] = useState("");
    const [lender, setLender] = useState("");
    const [principal, setPrincipal] = useState("");
    const [interestRate, setInterestRate] = useState("");
    const [termMonths, setTermMonths] = useState("");
    const [startDate, setStartDate] = useState("");
    const [loanCurrency, setLoanCurrency] = useState("USD");

    const PASS1_TIMEOUT_MS = 60_000;
    const PASS2_TIMEOUT_MS = 120_000;

    async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            return res;
        } finally {
            clearTimeout(timer);
        }
    }

    function getErrorMessage(err: unknown): string {
        if (err instanceof DOMException && err.name === "AbortError") {
            return "Request timed out. Please try again.";
        }
        if (err instanceof TypeError) {
            return "Network error. Please check your connection.";
        }
        if (err instanceof Error) {
            return err.message;
        }
        return "An unexpected error occurred.";
    }

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        if (!file) return;

        setError(null);
        setAnalyzing(true);

        const formData = new FormData();
        formData.set("document", file);

        try {
            // Pass 1: document understanding
            const res1 = await fetchWithTimeout("/api/analyze-loan/pass1", {
                method: "POST",
                body: formData,
            }, PASS1_TIMEOUT_MS);

            const data1 = await res1.json();

            if (!res1.ok) {
                setError(data1.error || "Failed to read document structure");
                setAnalyzing(false);
                return;
            }

            setPass1(data1.pass1);

            if (data1.requires_manual_input) {
                setRequiresManualInput(true);
                setExtraction(null);
                setScheduleRows([]);
                setAnalyzing(false);
                setStep("review");
                return;
            }

            // Pass 2: extract loan data
            setPass2Progress(true);

            const formData2 = new FormData();
            formData2.set("document", file);
            formData2.set("pass1", JSON.stringify(data1.pass1));

            const res2 = await fetchWithTimeout("/api/analyze-loan/pass2", {
                method: "POST",
                body: formData2,
            }, PASS2_TIMEOUT_MS);

            const data2 = await res2.json();

            if (!res2.ok) {
                setError(data2.error || "Failed to extract loan schedule");
                setAnalyzing(false);
                setPass2Progress(false);
                return;
            }

            setExtraction(data2.extraction);
            setScheduleRows(data2.extraction?.schedule ?? []);

            if (data2.extraction?.loan) {
                const l = data2.extraction.loan;
                setLoanName(l.name ?? "");
                setLender(l.lender ?? "");
                setPrincipal(l.principal?.toString() ?? "");
                setInterestRate(l.interest_rate?.toString() ?? "");
                setTermMonths(l.term_months?.toString() ?? "");
                setStartDate(l.start_date ?? "");
                setLoanCurrency(l.currency ?? "USD");
            }

            setAnalyzing(false);
            setPass2Progress(false);
            setStep("review");
        } catch (err) {
            setError(getErrorMessage(err));
            setAnalyzing(false);
            setPass2Progress(false);
        }
    }

    async function handleConfirm() {
        if (!loanName.trim()) {
            setError("Loan name is required");
            return;
        }
        if (!principal || isNaN(parseFloat(principal)) || parseFloat(principal) <= 0) {
            setError("Valid principal amount is required");
            return;
        }
        if (!interestRate || isNaN(parseFloat(interestRate)) || parseFloat(interestRate) <= 0) {
            setError("Valid interest rate is required");
            return;
        }
        if (!termMonths || isNaN(parseInt(termMonths)) || parseInt(termMonths) <= 0) {
            setError("Valid term in months is required");
            return;
        }
        if (!startDate) {
            setError("Start date is required");
            return;
        }
        if (!extraction && !requiresManualInput) return;
        setSubmitting(true);

        try {
            const loan = await createLoanWithSchedule(
                {
                    name: loanName.trim(),
                    lender: lender || null,
                    principal: parseFloat(principal),
                    interest_rate: interestRate ? parseFloat(interestRate) : null,
                    term_months: termMonths ? parseInt(termMonths) : null,
                    start_date: startDate || null,
                    currency: loanCurrency,
                    amortization_system: extraction?.loan?.amortization_system ?? "unknown",
                    extras: extraction?.loan?.extras ?? [],
                },
                scheduleRows
            );

            router.push(`/home/loans/${loan.id}`);
        } catch (err) {
            setError(getErrorMessage(err));
            setSubmitting(false);
        }
    }

    return (
        <>
            <SidebarNav activeMenu="loans" />
            <div className="flex-1 px-4 py-6 lg:p-8 pt-20 lg:pt-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-xl lg:text-2xl font-semibold text-paynes-gray mb-6">
                        Import Loan Document
                    </h1>

                    {error && (
                        <InlineNotification type="error" message={error} className="mb-4" />
                    )}

                    {step === "upload" && (
                        analyzing ? (
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 border-2 border-glaucous border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm text-paynes-gray">
                                        {pass2Progress
                                            ? "Extracting loan schedule..."
                                            : "Reading document structure..."}
                                    </p>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-glaucous rounded-full transition-all duration-500 ${pass2Progress ? "w-3/4" : "w-1/3"}`}
                                    />
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                    <label className="block text-sm font-medium text-paynes-gray mb-2">
                                        Upload Loan Document
                                    </label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-columbia-blue transition-colors"
                                    >
                                        {file ? (
                                            <p className="text-sm text-paynes-gray">
                                                {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                            </p>
                                        ) : (
                                            <div>
                                                <p className="text-sm text-paynes-gray mb-1">
                                                    Drop a PDF or image here, or click to browse
                                                </p>
                                                <p className="text-xs text-paynes-gray opacity-50">
                                                    PDF, JPEG, PNG, WebP — up to 15MB
                                                </p>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!file}
                                    className="px-4 py-2 text-sm font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors disabled:opacity-40"
                                >
                                    Analyze Document
                                </button>
                            </form>
                        )
                    )}

                    {step === "review" && pass1 && (
                        <div className="space-y-6">
                            {requiresManualInput && (
                                <InlineNotification type="warning" message="No payment schedule was found in the document. Enter the loan details below and we will generate a schedule." />
                            )}

                            {/* Pass 1 Understanding */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-xs font-medium text-paynes-gray opacity-80 mb-2">
                                    Document Analysis
                                </h3>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-paynes-gray opacity-60">Currency:</span>{" "}
                                        {pass1.currency}
                                    </div>
                                    <div>
                                        <span className="text-paynes-gray opacity-60">Date format:</span>{" "}
                                        {pass1.date_format}
                                    </div>
                                    <div>
                                        <span className="text-paynes-gray opacity-60">Number format:</span>{" "}
                                        {pass1.number_format}
                                    </div>
                                    <div>
                                        <span className="text-paynes-gray opacity-60">Schedule found:</span>{" "}
                                        {pass1.has_schedule_table ? "Yes" : "No"}
                                    </div>
                                </div>
                                {pass1.notes && (
                                    <p className="text-xs text-paynes-gray opacity-60 mt-2">
                                        {pass1.notes}
                                    </p>
                                )}
                            </div>

                            {/* Loan Header Fields */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-xs font-medium text-paynes-gray opacity-80 mb-3">
                                    Loan Details
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={loanName}
                                            onChange={(e) => setLoanName(e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                                            Lender
                                        </label>
                                        <input
                                            type="text"
                                            value={lender}
                                            onChange={(e) => setLender(e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                                            Principal
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={principal}
                                            onChange={(e) => setPrincipal(e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                                            Interest Rate (%)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={interestRate}
                                            onChange={(e) => setInterestRate(e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                                            Term (months)
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={termMonths}
                                            onChange={(e) => setTermMonths(e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-paynes-gray opacity-70 mb-1">
                                            Currency
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={3}
                                            value={loanCurrency}
                                            onChange={(e) => setLoanCurrency(e.target.value.toUpperCase())}
                                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent uppercase"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Grid */}
                            {extraction?.schedule && extraction.schedule.length > 0 && (
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                    <h3 className="text-xs font-medium text-paynes-gray opacity-80 mb-3">
                                        Payment Schedule
                                    </h3>
                                    <ScheduleGrid
                                        schedule={extraction.schedule}
                                        onChange={setScheduleRows}
                                    />
                                    {extraction.flags?.unmapped_columns?.length > 0 && (
                                        <div className="mt-2 text-xs text-amber-600">
                                            Unmapped columns: {extraction.flags.unmapped_columns.join(", ")}
                                        </div>
                                    )}
                                    {extraction.flags?.row_issues && extraction.flags.row_issues.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {extraction.flags.row_issues.map((issue, idx) => (
                                                <div key={idx} className="text-xs text-amber-600">
                                                    Row {issue.row_index + 1}: {issue.issue}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 items-center">
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={submitting || !loanName || !principal || !interestRate || !termMonths || !startDate}
                                    className="px-4 py-2 text-sm font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors disabled:opacity-40"
                                >
                                    {submitting ? "Saving…" : "Save Loan"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep("upload");
                                        setFile(null);
                                        setPass1(null);
                                        setExtraction(null);
                                        setScheduleRows([]);
                                        setError(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-paynes-gray bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <span className="text-xs text-paynes-gray opacity-40">
                                    Edits are saved when you click Save
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
