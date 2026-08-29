"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/hooks/supabaseQueries";
import { revalidatePath } from "next/cache";

export async function upsertUserSettings(formData: FormData) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    const base_currency = formData.get("base_currency") as string;
    const rawRate = formData.get("budgeting_fx_rate") as string | null;
    const budgeting_fx_rate = rawRate ? parseFloat(rawRate) : null;

    const { error } = await supabase
        .from("user_settings")
        .upsert(
            { user_id: user.id, base_currency, budgeting_fx_rate },
            { onConflict: "user_id" }
        );

    if (error) throw new Error(error.message);

    revalidatePath("/home/settings");
    revalidatePath("/home/budget");
}
