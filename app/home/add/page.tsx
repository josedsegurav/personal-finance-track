
import { createClient } from "@/utils/supabase/server";
import TabContent from "@/components/add/tabContent";
import { getUser, getCategories, getStores } from "@/hooks/supabaseQueries"
import SidebarNav from "@/components/sidebar";

export default async function Page() {
  const supabase = await createClient();

  const [user, categories, stores] = await Promise.all([
    getUser(supabase),
    getCategories(supabase),
    getStores(supabase)
  ]);

  return (
    <>
      <SidebarNav activeMenu="add" />
      {/* Main Content */}
      <TabContent categoriesData={categories} storesData={stores}/>
    </>
  );
}
