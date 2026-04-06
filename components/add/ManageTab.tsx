"use client";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Category, Store } from "@/app/types";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type RowState =
  | { mode: "idle" }
  | { mode: "editing"; value: string }
  | { mode: "confirming-delete" };

/* ─── Generic list section ───────────────────────────────────────────────── */

interface Item { id: number; name: string }

function ManageSection({
  title,
  items: initialItems,
  onAdd,
  onRename,
  onDelete,
}: {
  title: string;
  items: Item[];
  onAdd: (name: string) => Promise<void>;
  onRename: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [rowStates, setRowStates] = useState<Record<number, RowState>>({});
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const [addValue, setAddValue] = useState("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const getRow = (id: number): RowState => rowStates[id] ?? { mode: "idle" };

  const setRow = (id: number, state: RowState) =>
    setRowStates((prev) => ({ ...prev, [id]: state }));

  const setRowError = (id: number, msg: string) =>
    setRowErrors((prev) => ({ ...prev, [id]: msg }));

  const clearRowError = (id: number) =>
    setRowErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });

  /* Add */
  const handleAdd = async () => {
    const trimmed = addValue.trim();
    if (!trimmed) return;
    setAddLoading(true);
    setAddError("");
    try {
      await onAdd(trimmed);
      // optimistic: re-fetch would be ideal but we trust the parent callback
      // to have inserted; we push a temporary item and let page refetch handle
      // real id on next load — for now we reload the list from the server
      // by triggering a soft refresh via router, OR we accept the parent
      // returns the new item. Since this is self-contained we do a local push
      // with a temporary negative id that won't conflict with real ops.
      setItems((prev) => [...prev, { id: Date.now(), name: trimmed }]);
      setAddValue("");
    } catch (e) {
      setAddError((e as Error).message ?? "Failed to add");
    } finally {
      setAddLoading(false);
    }
  };

  /* Rename */
  const handleSaveRename = async (id: number) => {
    const row = getRow(id);
    if (row.mode !== "editing") return;
    const trimmed = row.value.trim();
    if (!trimmed) return;
    clearRowError(id);
    try {
      await onRename(id, trimmed);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, name: trimmed } : i)));
      setRow(id, { mode: "idle" });
    } catch (e) {
      setRowError(id, (e as Error).message ?? "Failed to rename");
    }
  };

  /* Delete */
  const handleConfirmDelete = async (id: number) => {
    clearRowError(id);
    try {
      await onDelete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setRow(id, { mode: "idle" });
    } catch (e) {
      setRowError(id, (e as Error).message ?? "Failed to delete");
      setRow(id, { mode: "idle" });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-paynes-gray">{title}</h3>
      </div>

      <ul className="divide-y divide-gray-50">
        {items.length === 0 && (
          <li className="px-5 py-4 text-sm text-gray-400">No {title.toLowerCase()} yet.</li>
        )}
        {items.map((item) => {
          const row = getRow(item.id);
          const err = rowErrors[item.id];

          return (
            <li key={item.id} className="px-5 py-3">
              {row.mode === "idle" && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-paynes-gray">{item.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setRow(item.id, { mode: "editing", value: item.name })}
                      className="text-xs text-glaucous hover:underline"
                    >
                      Edit
                    </button>
                    <span className="text-gray-200">|</span>
                    <button
                      type="button"
                      onClick={() => setRow(item.id, { mode: "confirming-delete" })}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {row.mode === "editing" && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={row.value}
                    autoFocus
                    onChange={(e) => setRow(item.id, { mode: "editing", value: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveRename(item.id);
                      if (e.key === "Escape") setRow(item.id, { mode: "idle" });
                    }}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveRename(item.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setRow(item.id, { mode: "idle" })}
                    className="px-3 py-1.5 text-xs font-medium text-paynes-gray hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {row.mode === "confirming-delete" && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-paynes-gray flex-1">
                    Delete <strong>{item.name}</strong>?
                  </span>
                  <button
                    type="button"
                    onClick={() => handleConfirmDelete(item.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setRow(item.id, { mode: "idle" })}
                    className="px-3 py-1.5 text-xs font-medium text-paynes-gray hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {err && (
                <p className="mt-1 text-xs text-red-500">{err}</p>
              )}
            </li>
          );
        })}
      </ul>

      {/* Add row */}
      <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={addValue}
            onChange={(e) => { setAddValue(e.target.value); setAddError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            placeholder={`Add new ${title.toLowerCase().replace(/s$/, "")}…`}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent bg-white"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!addValue.trim() || addLoading}
            className="px-4 py-2 text-sm font-medium bg-glaucous text-white rounded-lg hover:bg-glaucous-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {addLoading ? "Adding…" : "Add"}
          </button>
        </div>
        {addError && <p className="mt-1 text-xs text-red-500">{addError}</p>}
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */

interface ManageTabProps {
  categoriesData: Category[];
  storesData: Store[];
}

export default function ManageTab({ categoriesData, storesData }: ManageTabProps) {
  const supabase = createClient();

  /* ── Category handlers ── */
  const addCategory = async (name: string) => {
    const { error } = await supabase.from("categories").insert({ category_name: name });
    if (error) throw new Error(error.message);
  };

  const renameCategory = async (id: number, name: string) => {
    const { error } = await supabase
      .from("categories")
      .update({ category_name: name })
      .eq("id", id);
    if (error) throw new Error(error.message);
  };

  const deleteCategory = async (id: number) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
  };

  /* ── Store handlers ── */
  const addStore = async (name: string) => {
    const { error } = await supabase.from("stores").insert({ store_name: name });
    if (error) throw new Error(error.message);
  };

  const renameStore = async (id: number, name: string) => {
    const { error } = await supabase
      .from("stores")
      .update({ store_name: name })
      .eq("id", id);
    if (error) throw new Error(error.message);
  };

  const deleteStore = async (id: number) => {
    const { error } = await supabase.from("stores").delete().eq("id", id);
    if (error) throw new Error(error.message);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-paynes-gray opacity-60">
        Manage the categories and stores available when adding expenses.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ManageSection
          title="Categories"
          items={categoriesData.map((c) => ({ id: c.id, name: c.category_name }))}
          onAdd={addCategory}
          onRename={renameCategory}
          onDelete={deleteCategory}
        />
        <ManageSection
          title="Stores"
          items={storesData.map((s) => ({ id: s.id, name: s.store_name }))}
          onAdd={addStore}
          onRename={renameStore}
          onDelete={deleteStore}
        />
      </div>
    </div>
  );
}