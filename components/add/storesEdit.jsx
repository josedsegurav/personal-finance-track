"use client";

import { createClient } from "@/utils/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

export default function StoresEdit({ stores }) {
  const supabase = createClient();

  const [storeForm, setStoreForm] = useState({
    store: "",
  });
  const [newStore, setNewStore] = useState("");

  const handleChangeSelect = (e) => {
    const value = e.target.value;
    setStoreForm({
      store: value,
    });
  };

  const handleChangeAdd = (e) => {
    const name = e.target.value;
    setNewStore(name);
  };

  const handleAdd = async () => {
    try {
      const { data, error } = await supabase
        .from("stores")
        .insert({
          store_name: newStore,
        })
        .select();

      if (error) throw error;

      console.log(`added:`, data);
      alert(`Store ${newStore} added successfully!`);
      location.reload();

    } catch (err) {
      console.error("Error submitting form:", err);
      alert(`Failed to add store ${newStore}`);
    }

  };

  const handleEdit = async () => {
    try {
        const { data, error } = await supabase
        .from("stores")
        .update({store_name: newStore})
        .eq("id", storeForm.store)
        .select();

      if (error) throw error;

      console.log(`Updated:`, data);
      alert(`Store updated successfully!`);
      location.reload();

    } catch (err) {
      console.error("Error submitting form:", err);
      alert(`Failed to update store`);
    }
    };

  const handleDelete = async () => {
    try {
      const { data, error } = await supabase
        .from("stores")
        .delete()
        .eq("id", storeForm.store)
        .select();

      if (error) throw error;

      console.log(`deleted:`, data);
      alert(`Store deleted successfully!`);
      location.reload();

    } catch (err) {
      console.error("Error submitting form:", err);
      alert(`Failed to delete store`);
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="mt-4" variant="outline">
          Edit Stores
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Edit Stores</SheetTitle>
          <SheetDescription>Add a new store.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Add a store
            </Label>
            <Input
              id="name"
              placeholder="Store Name"
              className="col-span-3"
              onChange={handleChangeAdd}
            />
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button onClick={handleAdd}>Add</Button>
            </SheetClose>
          </SheetFooter>
          <div className="grid grid-cols-4 items-center gap-4">
            <SheetDescription className="col-span-4">
              Edit or delete a store.
            </SheetDescription>
            <Label htmlFor="storeEdit">Change a Store</Label>
            <select
              id="newStore"
              name="newStore"
              value={storeForm.store}
              onChange={handleChangeSelect}
              className="col-span-3 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
              required
            >
              <option value="">Select a store</option>
                    {stores &&
                      stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.store_name}
                        </option>
                      ))}
            </select>
            <Label htmlFor="storeEdit">New Store</Label>
            <Input
              id="storeEdit"
              className="col-span-3"
              placeholder="Store Name"
              onChange={handleChangeAdd}
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button onClick={handleEdit}>Edit</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
