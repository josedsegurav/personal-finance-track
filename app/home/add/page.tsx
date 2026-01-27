import Sidebar from "@/components/sidebar";
import { createClient } from "@/utils/supabase/server";
import TabContent from "@/components/add/tabContent";
import { getUser, getCategories, getStores } from "@/hooks/supabaseQueries"
import { Category, Store } from "@/app/types";

export default async function Page() {
  const supabase = await createClient();

  await getUser(supabase);

  const categories = await getCategories(supabase) as unknown as Category[];

  const stores = await getStores(supabase) as unknown as Store[];

  return (
    <>
      <Sidebar activeMenu="add" />
      {/* Main Content */}
      <TabContent categoriesData={categories} storesData={stores}/>
    </>
  );
}
