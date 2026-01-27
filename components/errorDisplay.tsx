'use client';

interface ErrorDisplayProps {
    title?: string;
    error: Error;
    reset?: () => void;
}

export default function ErrorDisplay({
    title = "Something went wrong",
    error,
    reset
}: ErrorDisplayProps) {
    return (
        <div className="p-4 border border-red-500 rounded">
            <h2 className="text-red-600 font-bold">{title}</h2>
            <p className="text-sm text-gray-600">{error.message}</p>
            {reset && (
                <button
                    onClick={reset}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Try again
                </button>
            )}
        </div>
    );
}