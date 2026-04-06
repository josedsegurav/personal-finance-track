"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function budgetRedirect(year: number, month1to12: number) {
  return `/home/budget?year=${year}&month=${month1to12}`;
}

export async function upsertCategoryBudgetAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const year = Number.parseInt(String(formData.get("year")), 10);
  const month1to12 = Number.parseInt(String(formData.get("month")), 10);
  const categoryId = Number.parseInt(String(formData.get("categoryId")), 10);
  const raw = String(formData.get("allocated") ?? "").trim();
  const dest = budgetRedirect(year, month1to12);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month1to12) ||
    month1to12 < 1 ||
    month1to12 > 12 ||
    !Number.isFinite(categoryId)
  ) {
    redirect(dest);
  }

  if (raw === "") {
    await supabase
      .from("category_budgets")
      .delete()
      .eq("user_id", user.id)
      .eq("category_id", categoryId)
      .eq("year", year)
      .eq("month", month1to12);
    revalidatePath("/home/budget");
    redirect(dest);
  }

  const allocated = Number.parseFloat(raw);
  if (!Number.isFinite(allocated) || allocated < 0) {
    revalidatePath("/home/budget");
    redirect(dest);
  }

  if (allocated === 0) {
    await supabase
      .from("category_budgets")
      .delete()
      .eq("user_id", user.id)
      .eq("category_id", categoryId)
      .eq("year", year)
      .eq("month", month1to12);
    revalidatePath("/home/budget");
    redirect(dest);
  }

  const { error } = await supabase.from("category_budgets").upsert(
    {
      user_id: user.id,
      category_id: categoryId,
      year,
      month: month1to12,
      allocated_amount: allocated,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,category_id,year,month" }
  );

  if (error) {
    console.error("[upsertCategoryBudgetAction]", error.message);
  }

  revalidatePath("/home/budget");
  redirect(dest);
}
