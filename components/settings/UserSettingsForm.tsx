"use client";

import { useState } from "react";
import { upsertUserSettings } from "@/app/home/settings/actions";
import type { UserSettings } from "@/app/types";

interface Props {
    settings: UserSettings | null;
}

export default function UserSettingsForm({ settings }: Props) {
    const [baseCurrency, setBaseCurrency] = useState(settings?.base_currency ?? "USD");
    const [fxRate, setFxRate] = useState(settings?.budgeting_fx_rate?.toString() ?? "");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const fd = new FormData();
            fd.set("base_currency", baseCurrency.toUpperCase().trim());
            if (fxRate) fd.set("budgeting_fx_rate", fxRate);
            await upsertUserSettings(fd);
            setMessage({ type: "success", text: "Settings saved" });
        } catch {
            setMessage({ type: "error", text: "Failed to save settings" });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xs lg:text-sm font-medium text-paynes-gray opacity-80 mb-4">
                Currency & Conversion
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="base_currency" className="block text-xs text-paynes-gray opacity-70 mb-1">
                        Base Currency
                    </label>
                    <input
                        id="base_currency"
                        type="text"
                        value={baseCurrency}
                        onChange={(e) => setBaseCurrency(e.target.value)}
                        placeholder="USD"
                        maxLength={3}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent uppercase"
                    />
                    <p className="text-[10px] text-paynes-gray opacity-50 mt-1">
                        3-letter currency code (e.g. USD, EUR, GBP)
                    </p>
                </div>

                <div>
                    <label htmlFor="budgeting_fx_rate" className="block text-xs text-paynes-gray opacity-70 mb-1">
                        Budgeting FX Rate
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-paynes-gray">1 loan currency =</span>
                        <input
                            id="budgeting_fx_rate"
                            type="number"
                            min="0"
                            step="0.000001"
                            value={fxRate}
                            onChange={(e) => setFxRate(e.target.value)}
                            placeholder="1.000000"
                            className="w-32 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                        />
                        <span className="text-xs text-paynes-gray">{baseCurrency || "base currency"} units</span>
                    </div>
                    <p className="text-[10px] text-paynes-gray opacity-50 mt-1">
                        Used for manual loan currency conversion in budgeting. Leave empty if you only use one currency.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-1.5 text-xs font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors disabled:opacity-40"
                    >
                        {saving ? "Saving…" : "Save"}
                    </button>
                    {message && (
                        <span className={`text-xs ${message.type === "success" ? "text-green-600" : "text-bittersweet"}`}>
                            {message.text}
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}
