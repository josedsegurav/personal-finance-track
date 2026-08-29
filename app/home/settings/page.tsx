import { createClient } from "@/utils/supabase/server";
import SidebarNav from "@/components/sidebar";
import { getUserSettings } from "@/hooks/supabaseQueries";
import UserSettingsForm from "@/components/settings/UserSettingsForm";

export default async function SettingsPage() {
    const supabase = await createClient();
    const settings = await getUserSettings(supabase);

    return (
        <>
            <SidebarNav activeMenu="settings" />
            <div className="flex-1 px-4 py-6 lg:p-8 pt-20 lg:pt-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-xl lg:text-2xl font-semibold text-paynes-gray mb-6">Settings</h1>
                    <div className="max-w-lg">
                        <UserSettingsForm settings={settings} />
                    </div>
                </div>
            </div>
        </>
    );
}
