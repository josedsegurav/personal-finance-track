import Head from 'next/head'
import { Geist } from "next/font/google";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers"
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Personal Finance track",
  description: "Easy way to organize and manage your finances",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
   const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "false"
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body className="bg-ghost-white text-foreground">
        <SidebarProvider defaultOpen={defaultOpen}>

          <main className="mx-auto">
            <div>
              <div>{children}</div>
            </div>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
