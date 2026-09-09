import { NextRequest, NextResponse } from "next/server";
import { detectAmortizationSystem } from "@/lib/loanAmortization";
import type { LoanDocumentUnderstanding, LoanExtractionResult } from "@/app/types";
import {
    genAI,
    callGemini,
    extractFileFromRequest,
    ValidationError,
    GeminiExtractionError,
} from "@/lib/loanAnalyzerShared";

function buildPass2SystemInstruction(pass1: LoanDocumentUnderstanding): string {
    const colHints =
        pass1.column_labels.length > 0
            ? `The document's column labels are: ${pass1.column_labels.join(", ")}. Map them to our canonical fields.`
            : "No explicit column labels detected. Infer the structure from the table.";

    return `You are extracting loan data from a document.

Document format detected:
- Currency: ${pass1.currency}
- Date format: ${pass1.date_format}
- Number format: ${pass1.number_format}
- ${colHints}

Return ONLY this JSON shape (no markdown, no extra text):
{
  "loan": {
    "name": "short descriptive name for this loan",
    "lender": "lender name or null",
    "principal": "total loan amount as number",
    "interest_rate": "annual interest rate as number (percent, e.g. 11.5 for 11.5%) or null if not stated",
    "term_months": "total term in months as number or null",
    "start_date": "start date in YYYY-MM-DD format or null",
    "currency": "3-letter currency code",
    "extras": [{"label": "any header-level extra field name", "amount": number | string | null}]
  },
  "schedule": [
    {
      "due_date": "date in YYYY-MM-DD format",
      "capital": "capital/principal portion as number or null",
      "interest": "interest portion as number or null",
      "total_payment": "total payment amount as number or null",
      "balance_after": "remaining balance after payment as number or null",
      "extras": [{"label": "extra column name", "amount": number | string | null}]
    }
  ],
  "flags": {
    "schedule_found": true,
    "unmapped_columns": ["list of columns that couldn't be mapped"],
    "row_issues": [{"row_index": 0, "issue": "description of any data issue"}]
  }
}

Canonical field mapping rules:
- Map "cuota", "pago", "payment", "mensualidad" → total_payment
- Map "capital", "amortización", "principal" → capital
- Map "interés", "interes", "interest" → interest
- Map "saldo", "balance", "remaining" → balance_after
- Map "fecha", "date", "vencimiento", "due" → due_date
- Any column that doesn't match these goes into extras as {"label": "original header", "amount": value} where value is number if monetary, otherwise original string marker (e.g. "POR VENCER", "-") or null if empty. Do not coerce non-numeric markers to 0.

Number parsing: use the detected number format (${pass1.number_format}) to correctly parse values.
Date parsing: use the detected date format (${pass1.date_format}) to produce YYYY-MM-DD output.

If a row's capital + interest does not equal total_payment, add a row_issue.
If schedule is empty but the document has a schedule, still return schedule_found: true with an empty array.`;
}

export async function POST(request: NextRequest) {
    try {
        if (!genAI) {
            return NextResponse.json(
                { error: "Gemini API key not configured" },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const { base64, mimeType } = await extractFileFromRequest(request, formData);
        const pass1Raw = formData.get("pass1") as string;
        if (!pass1Raw) {
            throw new ValidationError("Missing pass1 understanding data");
        }

        let pass1: LoanDocumentUnderstanding;
        try {
            pass1 = JSON.parse(pass1Raw);
        } catch {
            throw new ValidationError("Invalid pass1 data format");
        }

        const pass2Prompt = buildPass2SystemInstruction(pass1);
        const extraction: LoanExtractionResult = await callGemini(
            pass2Prompt,
            base64,
            mimeType,
            65536 // pass2 returns a full schedule; pass1's small default is not enough
        );

        const schedule = Array.isArray(extraction?.schedule) ? extraction.schedule : [];
        const amortizationSystem = detectAmortizationSystem(schedule);

        return NextResponse.json({
            extraction: {
                ...extraction,
                schedule,
                loan: {
                    ...extraction?.loan,
                    amortization_system: amortizationSystem,
                },
            },
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        if (error instanceof GeminiExtractionError) {
            return NextResponse.json({ error: error.message }, { status: 502 });
        }
        console.error("Error in pass2:", error);
        return NextResponse.json(
            {
                error: "Failed to extract loan data",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
