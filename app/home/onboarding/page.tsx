import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/hooks/supabaseQueries";
import { redirect } from "next/navigation";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
    const supabase = await createClient();
    await getUser(supabase);

    // If the user already has categories and stores, they don't need onboarding
    const [{ count: catCount }, { count: storeCount }] = await Promise.all([
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("stores").select("id", { count: "exact", head: true }),
    ]);

    if ((catCount ?? 0) > 0 && (storeCount ?? 0) > 0) {
        redirect("/home/dashboard");
    }

    return <OnboardingWizard />;
}