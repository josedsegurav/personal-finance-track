"use client";

interface TransactionTabsProps {
  active: "all" | "expenses" | "purchases";
  onChange: (tab: "all" | "expenses" | "purchases") => void;
}

export default function TransactionTabs({ active, onChange }: TransactionTabsProps) {
  const tabs: { id: "all" | "expenses" | "purchases"; label: string }[] = [
    { id: "all", label: "All Transactions" },
    { id: "expenses", label: "Expenses" },
    { id: "purchases", label: "Purchases" },
  ];

  return (
    <div className="flex justify-center border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`py-3 px-6 font-medium ${
            active === tab.id
              ? "text-glaucous border-b-2 border-glaucous"
              : "text-paynes-gray hover:text-glaucous"
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}