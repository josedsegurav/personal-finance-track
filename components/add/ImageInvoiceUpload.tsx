"use client";
import { useState } from "react";
import { Upload, Loader2, X, AlertCircle } from "lucide-react";
import Image from "next/image";

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
    const [fileImg, setFileImg] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        // Clear previous state
        if (preview && fileImg?.type === 'application/pdf') {
            URL.revokeObjectURL(preview);
        }
        setError(null);
        setPreview(null);
        setFileImg(null);

        if (!file) return;

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        const isAllowedMime = allowedMimeTypes.includes(file.type);
        const isPdfByExtension = file.name.toLowerCase().endsWith('.pdf');
        const isImageByMime = file.type.startsWith('image/');

        // Validate file type - support images and PDF
        if (!isAllowedMime && !isPdfByExtension && !isImageByMime) {
            setError('Please upload an image or PDF file (JPG, PNG, WEBP, PDF)');
            e.target.value = ''; // Clear the input
            return;
        }

        // Validate file size (max 15MB to match loan flow)
        if (file.size > 15 * 1024 * 1024) {
            setError('File size should be less than 15MB');
            e.target.value = ''; // Clear the input
            return;
        }

        setFileImg(file);
        setIsUploading(true);

        // Create preview - PDF uses object URL, images use FileReader
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (isPdf) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            setIsUploading(false);
        } else {
            const reader = new FileReader();

            reader.onloadend = () => {
                setPreview(reader.result as string);
                setIsUploading(false);
            };

            reader.onerror = () => {
                setError('Failed to read the selected file. Please try again.');
                setIsUploading(false);
                setFileImg(null);
                e.target.value = ''; // Clear the input
            };

            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!fileImg) {
            setError('Please select an image or PDF first');
            return;
        }

        setError(null); // Clear previous errors
        setAnalyzing(true);

        try {
            const formData = new FormData();
            formData.append('image', fileImg);

            const response = await fetch('/api/analyze-invoice', {
                method: 'POST',
                body: formData,
            });

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned an invalid response');
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Server error: ${response.status}`);
            }

            if (result.success && result.data) {
                onDataExtracted(result.data);

                // Show success feedback, then clear after user has time to see it
                setTimeout(() => {
                    clearPreview();
                }, 2000);
            } else {
                throw new Error('No data extracted from invoice');
            }
        } catch (err) {
            console.error('Error analyzing invoice:', err);

            // Provide more specific error messages
            if (err instanceof TypeError && err.message === 'Failed to fetch') {
                setError('Network error. Please check your connection and try again.');
            } else {
                setError(err instanceof Error ? err.message : 'Failed to analyze invoice. Please try again.');
            }
        } finally {
            setAnalyzing(false);
        }
    };

    const clearPreview = () => {
        if (preview && fileImg?.type === 'application/pdf') {
            URL.revokeObjectURL(preview);
        }
        setPreview(null);
        setError(null);
        setIsUploading(false);
        setAnalyzing(false);
        setFileImg(null);

        // Clear the file input
        const input = document.getElementById('invoice-upload') as HTMLInputElement;
        if (input) input.value = '';
    };

    const isDisabled = isUploading || analyzing;

    return (
        <div className="mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-dashed border-blue-200">
                <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-blue-400 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Upload Invoice
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        AI will automatically extract and fill the form data
                    </p>

                    <label
                        htmlFor="invoice-upload"
                        className={`inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg transition-all ${
                            isDisabled
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer hover:bg-blue-700 hover:shadow-lg'
                        }`}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-5 w-5" />
                                Choose File
                            </>
                        )}
                    </label>

                    <input
                        id="invoice-upload"
                        type="file"
                        accept=".pdf,image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        disabled={isDisabled}
                        className="hidden"
                    />

                    <p className="text-xs text-gray-500 mt-2">
                        Supports JPG, PNG, WEBP, PDF (max 15MB)
                    </p>
                </div>

                {/* Preview */}
                {preview && (
                    <div className="mt-4 relative flex flex-col items-center">
                        <button
                            onClick={clearPreview}
                            disabled={analyzing}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Clear preview"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        {fileImg?.type === 'application/pdf' || fileImg?.name.toLowerCase().endsWith('.pdf') ? (
                            <div className="w-full flex flex-col items-center">
                                <div className="w-full max-w-sm bg-white rounded-lg shadow-lg border p-4 flex flex-col items-center">
                                    <p className="text-sm font-medium text-gray-700 truncate w-full text-center">{fileImg?.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{fileImg ? (fileImg.size / 1024 / 1024).toFixed(2) + ' MB' : ''} — PDF</p>
                                </div>
                                <embed
                                    src={preview}
                                    type="application/pdf"
                                    className="w-full max-w-sm h-64 mt-3 rounded-lg border shadow-sm"
                                />
                            </div>
                        ) : (
                            <Image
                                src={preview}
                                alt="Invoice preview"
                                width={150}
                                height={200}
                                className="max-h-64 mx-auto rounded-lg shadow-lg"
                            />
                        )}
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className={`mt-5 w-fit px-6 py-3 bg-blue-600 text-white font-medium rounded-lg transition-all inline-flex items-center ${
                                analyzing
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'cursor-pointer hover:bg-blue-700'
                            }`}
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                    Analyzing...
                                </>
                            ) : (
                                'Analyze Invoice'
                            )}
                        </button>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}