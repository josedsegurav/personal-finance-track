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

export default function CategoryEdit({ categories }) {
  const supabase = createClient();

  const [categoryForm, setCategoryForm] = useState({
    category: "",
  });
  const [newcategory, setNewCategory] = useState("");

  const handleChangeSelect = (e) => {
    const value = e.target.value;
    setCategoryForm({
      category: value,
    });
  };

  const handleChangeAdd = (e) => {
    const name = e.target.value;
    setNewCategory(name);
  };

  const handleAdd = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          category_name: newcategory,
        })
        .select();

      if (error) throw error;

      console.log(`added:`, data);
      router.refresh();
      alert(`Category ${newcategory} added successfully!`);
      location.reload();

    } catch (err) {
      console.error("Error submitting form:", err);
      alert(`Failed to add category ${newcategory}`);
    }

  };

  const handleEdit = async () => {
    try {
        const { data, error } = await supabase
        .from("categories")
        .update({category_name: newcategory})
        .eq("id", categoryForm.category)
        .select();

      if (error) throw error;

      console.log(`Updated:`, data);
      alert(`Category updated successfully!`);
      location.reload();

    } catch (err) {
      console.error("Error submitting form:", err);
      alert(`Failed to update category`);
    }
    };

  const handleDelete = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryForm.category)
        .select();

      if (error) throw error;

      console.log(`deleted:`, data);
      alert(`Category deleted successfully!`);
      location.reload();

    } catch (err) {
      console.error("Error submitting form:", err);
      alert(`Failed to delete category`);
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="mt-4" variant="outline">
          Edit Categories
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Edit Categories</SheetTitle>
          <SheetDescription>Add a new category.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Add a category
            </Label>
            <Input
              id="name"
              placeholder="Category Name"
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
              Edit or delete a category.
            </SheetDescription>
            <Label htmlFor="categoryEdit">Change a Category</Label>
            <select
              id="newcategory"
              name="newcategory"
              value={categoryForm.category}
              onChange={handleChangeSelect}
              className="col-span-3 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-columbia-blue focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {categories &&
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
            </select>
            <Label htmlFor="categoryEdit">New Category</Label>
            <Input
              id="categoryEdit"
              className="col-span-3"
              placeholder="Category Name"
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
