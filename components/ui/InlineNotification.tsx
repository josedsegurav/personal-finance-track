interface Props {
    type: "success" | "error" | "warning" | "info";
    message: string;
    className?: string;
}

const STYLES: Record<Props["type"], { bg: string; border: string; text: string }> = {
    success: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
    },
    error: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-bittersweet",
    },
    warning: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-800",
    },
    info: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
    },
};

export default function InlineNotification({ type, message, className = "" }: Props) {
    const s = STYLES[type];
    return (
        <div className={`${s.bg} ${s.border} border rounded-lg p-3 text-xs ${s.text} ${className}`}>
            {message}
        </div>
    );
}
