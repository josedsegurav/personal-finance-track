"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/hooks/supabaseQueries";
import { revalidatePath } from "next/cache";

export async function upsertBudget(formData: FormData) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const category_id = Number(formData.get("category_id"));
    const amount = parseFloat(formData.get("amount") as string);
    const month = Number(formData.get("month"));
    const year = Number(formData.get("year"));

    const { error } = await supabase
        .from("budgets")
        .upsert(
            { user_id: user.id, category_id, amount, month, year },
            { onConflict: "user_id,category_id,month,year" }
        );

    if (error) throw new Error(error.message);

    revalidatePath("/home/budget");
}

export async function deleteBudget(id: number) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/home/budget");
}