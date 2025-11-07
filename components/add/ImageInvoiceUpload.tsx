"use client";
import { useState } from "react";
import { Upload, Loader2, X } from "lucide-react";

interface ExtractedData {
    expense: {
        description: string;
        payment_method: string;
        store: string;
        amount: string;
        total_expense: string;
        date: string;
    };
    purchases: Array<{
        item: string;
        category: string;
        purchaseAmount: string;
        taxes: string;
        notes: string;
    }>;
}

interface ImageInvoiceUploadProps {
    onDataExtracted: (data: ExtractedData) => void;
}

export default function ImageInvoiceUpload({ onDataExtracted }: ImageInvoiceUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fileImg, setFileImg] = useState<File | undefined>();
    const [analyzing, setAnalizing] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileImg(file)
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }



        setError(null);
        setIsUploading(true);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
            setIsUploading(false);
        };
        reader.onerror = () => {
            setError('Failed to read the selected image');
            setIsUploading(false);
        };

        reader.readAsDataURL(file);
    };
    const handleAnalize = async () => {
        if (!fileImg) return;

        setAnalizing(true);
        try {
            const formData = new FormData();
            formData.append('image', fileImg);

            const response = await fetch('/api/analyze-invoice', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to analyze invoice');
            }

            if (result.success && result.data) {
                onDataExtracted(result.data);
                // Clear preview after successful extraction
                setTimeout(() => setPreview(null), 2000);
            }
        } catch (err) {
            console.error('Error uploading image:', err);
            setError(err instanceof Error ? err.message : 'Failed to analyze invoice');
        } finally {
            setAnalizing(false);
        }
    }

    const clearPreview = () => {
        setPreview(null);
        setError(null);
        setIsUploading(false);
        setAnalizing(false);
        setFileImg(undefined);
    };

    return (
        <div className="mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-dashed border-blue-200">
                <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-blue-400 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Upload Invoice Image
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        AI will automatically extract and fill the form data
                    </p>

                    <label
                        htmlFor="invoice-upload"
                        className={`inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg cursor-pointer transition-all ${isUploading
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-blue-700 hover:shadow-lg'
                            }`}
                    >
                        <Upload className="mr-2 h-5 w-5" />
                        Choose Image


                    </label>

                    <input
                        id="invoice-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                    />

                    <p className="text-xs text-gray-500 mt-2">
                        Supports JPG, PNG, WEBP (max 5MB)
                    </p>
                </div>

                {/* Preview */}
                {preview && (
                    <div className="mt-4 relative flex flex-col items-center">
                        <button
                            onClick={clearPreview}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <img
                            src={preview}
                            alt="Invoice preview"
                            className="max-h-64 mx-auto rounded-lg shadow-lg"
                        />
                        <button onClick={handleAnalize} disabled={analyzing} className={`mt-5 w-fit px-6 py-3 bg-blue-600 text-white font-medium rounded-lg transition-all ${analyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            {analyzing ? <Loader2 className="animate-spin mr-2 h-5 w-5"/> : "Analyze"}
                        </button>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}