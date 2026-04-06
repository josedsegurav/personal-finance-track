
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="">
        <div className="flex justify-center min-h-screen bg-ghost-white mt-12">
          {/* Mobile-optimized Sidebar Trigger */}
          {/* <div className="fixed top-4 left-4 z-50">
            <SidebarTrigger className="bg-white shadow-lg rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" />
          </div> */}
          {children}

        </div>
      </div>
    </>
  );
}
