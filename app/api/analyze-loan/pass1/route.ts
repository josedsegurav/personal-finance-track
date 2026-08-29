import { NextRequest, NextResponse } from "next/server";
import type { LoanDocumentUnderstanding } from "@/app/types";
import {
    genAI,
    callGemini,
    extractFileFromRequest,
    ValidationError,
    GeminiExtractionError,
} from "@/lib/loanAnalyzerShared";

const PASS1_SYSTEM_INSTRUCTION = `You are analyzing a loan document. Your job is to understand the document structure.

Return ONLY this JSON shape (no markdown, no extra text):
{
  "has_schedule_table": true/false,
  "currency": "3-letter currency code seen in the document",
  "date_format": "e.g. DD/MM/YYYY or MM/DD/YYYY or YYYY-MM-DD",
  "number_format": "e.g. 1,234.56 or 1.234,56",
  "column_labels": ["list", "of", "column", "headers", "as they appear"],
  "notes": "Any observations about the document structure"
}

Focus on detecting whether a payment schedule table exists and what format conventions the document uses.`;

export async function POST(request: NextRequest) {
    try {
        if (!genAI) {
            return NextResponse.json(
                { error: "Gemini API key not configured" },
                { status: 500 }
            );
        }

        const { base64, mimeType } = await extractFileFromRequest(request);

        const pass1: LoanDocumentUnderstanding = await callGemini(
            PASS1_SYSTEM_INSTRUCTION,
            base64,
            mimeType,
            2048
        );

        if (!pass1.has_schedule_table) {
            return NextResponse.json({
                pass1,
                requires_manual_input: true,
                message:
                    "No payment schedule table found in the document. You can enter loan details manually and we will generate the schedule.",
            });
        }

        return NextResponse.json({
            pass1,
            requires_manual_input: false,
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        if (error instanceof GeminiExtractionError) {
            return NextResponse.json({ error: error.message }, { status: 502 });
        }
        console.error("Error in pass1:", error);
        return NextResponse.json(
            {
                error: "Failed to analyze loan document",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
