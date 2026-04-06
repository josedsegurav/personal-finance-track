import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { getCategories, getStores } from "@/hooks/supabaseQueries";
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

const categories = async () => {
  const supabase = await createClient();
  const data = await getCategories(supabase);
  return data;
};

const stores = async () => {
  const supabase = await createClient();
  const data = await getStores(supabase);
  return data;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // 3. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const result = await genAI?.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [

            {
              inlineData: {
                mimeType: file.type,
                data: base64Image,
              },
            },
          ],
        }
      ],
      config: {
        systemInstruction: `Analyze this invoice/receipt image following this guidelines:
    Follow these guidelines
- Extract ALL individual items from the receipt
- If payment method is unclear, use "credit card"
- If date is not found, use today's date
- "amount" should be subtotal before taxes
- "total_expense" should be the final total
- Provide notes of 50 characters max for every item
- Be accurate with numbers
- Return ONLY valid JSON, no markdown or additional text
- For Walmart store, follow this tax guide: After the item price there is a letter that indicates the tax percentage: D, H = 0%; Y, Z = 5%; A, C, E, J = 12%
- For Costco store, follow this tax guide: After the item price there is a letter that indicates the tax percentage: G = 5%; P = 7%; GP = 12%, if there is no letter beside the price it is 0%
- For taxes in other stores, choose closest match: 0%, 5%, or 12%
- Use the categories from the database to match the category of the item using this list: ${categories}
- Use the stores from the database to match the store of the item using this list: ${stores}
- If the category is not found, use "other"
- If the store is not found, use "other"

 Put the information in this JSON format:

{
  "expense": {
    "description": "Brief description of the purchase",
    "payment_method": "credit card | debit card | cash | bank transfer",
    "store": "Store name (from the database)",
    "amount": "Total amount before taxes (number only, string format)",
    "total_expense": "Total amount including taxes (number only, string format)",
    "date": "Date in YYYY-MM-DD format"
  },
  "purchases": [
    {
      "item": "Item name",
      "category": "Category name (from the database)",
      "purchaseAmount": "Item price (number only, string format)",
      "taxes": "Tax percentage as string (0%, 5%, 12%)",
      "notes": "Any relevant notes"
    }
  ]
}`
      }
    });

    const text = result?.text;

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