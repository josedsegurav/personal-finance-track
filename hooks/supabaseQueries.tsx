import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function getUser(supabase: Awaited<ReturnType<typeof createClient>>) {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/sign-in");
    }

    return user;
}

export async function getCategories(supabase: Awaited<ReturnType<typeof createClient>>) {

    const { data, error } = await supabase.from("categories").select("*");

    if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data;
}

export async function getStores(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data, error } = await supabase.from("stores").select("*");

    if (error) {
        throw new Error(`Failed to fetch stores: ${error.message}`);
    }

    return data;
}