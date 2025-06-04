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
        {children}
      </div>
      </div>
    </>
  );
}
