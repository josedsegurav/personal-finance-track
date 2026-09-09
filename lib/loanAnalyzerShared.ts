import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

export const MAX_FILE_SIZE = 15 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export const apiKey = process.env.GEMINI_API_KEY;
export const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

export class GeminiExtractionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GeminiExtractionError";
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

/**
 * @param maxOutputTokens Ceiling for the model's response. Pass2 (full schedules)
 * needs a much higher budget than pass1 (a small structure summary).
 */
export async function callGemini(
    prompt: string,
    fileBase64: string,
    mimeType: string,
    maxOutputTokens: number = 8192
) {
    if (!genAI) {
        throw new GeminiExtractionError("Gemini API key not configured");
    }

    const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        inlineData: {
                            mimeType,
                            data: fileBase64,
                        },
                    },
                ],
            },
        ],
        config: {
            responseMimeType: "application/json",
            systemInstruction: prompt,
            maxOutputTokens,
            // Keep the thinking budget small so it doesn't eat into maxOutputTokens
            // and starve the actual JSON output for large schedules.
            thinkingConfig: { thinkingBudget: 0 },
        },
    });

    const candidate = result?.candidates?.[0];
    const usage = result?.usageMetadata;

    if (candidate?.finishReason === "MAX_TOKENS") {
        console.error("Gemini MAX_TOKENS hit", {
            maxOutputTokens,
            promptTokenCount: usage?.promptTokenCount,
            candidatesTokenCount: usage?.candidatesTokenCount,
            thoughtsTokenCount: usage?.thoughtsTokenCount,
            totalTokenCount: usage?.totalTokenCount,
        });
        throw new GeminiExtractionError(
            "The document response was too large and got cut off before finishing. " +
                "Try a shorter document, or split multi-page schedules into smaller uploads."
        );
    }

    if (candidate?.finishReason && !["STOP", "MAX_TOKENS"].includes(candidate.finishReason)) {
        throw new GeminiExtractionError(
            `Gemini stopped unexpectedly (${candidate.finishReason}). Please try again.`
        );
    }

    const text = result?.text;
    if (!text || !text.trim()) {
        throw new GeminiExtractionError("Gemini returned an empty response.");
    }

    try {
        return JSON.parse(text);
    } catch {
        throw new GeminiExtractionError(
            "Gemini returned a response that could not be parsed as JSON."
        );
    }
}

export async function extractFileFromRequest(
    request: NextRequest,
    existingFormData?: FormData
): Promise<{
    file: File;
    base64: string;
    mimeType: string;
}> {
    const formData = existingFormData ?? await request.formData();
    const file = formData.get("document") as File;

    if (!file) {
        throw new ValidationError("No document file provided");
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new ValidationError(
            `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`
        );
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new ValidationError(
            `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
        );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    return { file, base64, mimeType: file.type };
}
