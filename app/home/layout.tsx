import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
    <div className="">
      <div className="flex justify-center min-h-screen bg-ghost-white">
        {/* Mobile-optimized Sidebar Trigger */}
    <div className="fixed top-4 left-4 z-50">
      <SidebarTrigger className="bg-white shadow-lg rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" />
    </div>
        {children}
      </div>
      </div>
    </>
  );
}
