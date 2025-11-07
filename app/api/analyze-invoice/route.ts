import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const prompt = `Analyze this invoice/receipt image following this guidelines:

    Follow these guidelines
- Extract ALL individual items from the receipt
- If payment method is unclear, use "credit card"
- If date is not found, use today's date
- "amount" should be subtotal before taxes
- "total_expense" should be the final total
- Provide notes for every item of max 50 characters
- Be accurate with numbers
- Return ONLY valid JSON, no markdown or additional text
- For Walmart store, follow this tax guide: After the item price there is a letter that indicates the tax percentage: D, H = 0%; Y, Z = 5%; A, C, E, J = 12%
- For Costco store, follow this tax guide: After the item price there is a letter that indicates the tax percentage: G = 5%; P = 7%; GP = 12%, if there is no letter beside the price it is 0%
- For taxes in other stores, choose closest match: 0%, 5%, or 12%

 Put the information in this JSON format:

{
  "expense": {
    "description": "Brief description of the purchase",
    "payment_method": "credit card | debit card | cash | bank transfer",
    "store": "Store name",
    "amount": "Total amount before taxes (number only)",
    "total_expense": "Total amount including taxes (number only)",
    "date": "Date in YYYY-MM-DD format"
  },
  "purchases": [
    {
      "item": "Item name",
      "category": "Category name (groceries, electronics, clothing, etc.)",
      "purchaseAmount": "Item price (number only)",
      "taxes": "Tax percentage as string (0%, 5%, 12%)",
      "notes": "Any relevant notes"
    }
  ]
}`

    const result = await genAI?.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
          {
            role: "assistant",
            parts: [
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64Image,
                },
              },
            ],
          },
        ],
      });

    const text = result?.text;

console.log(text);
    // Clean up response (remove markdown code blocks if present)
    let cleanedText = text?.trim();
    if (cleanedText?.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText?.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    const extractedData = JSON.parse(cleanedText ?? '{}' as string);

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
  } catch (error) {
    console.error('Error analyzing invoice:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze invoice',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}