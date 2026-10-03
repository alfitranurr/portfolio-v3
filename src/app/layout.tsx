import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { VisitorTracker } from "@/components/visitor-tracker";
import { TopLoader } from "@/components/top-loader";
import { ScrollToTop } from "@/components/scroll-to-top";
import { MainLayoutContainer } from "@/components/main-layout-container";
import { AdminSidebarSlot } from "@/components/admin-sidebar-slot";
import { getProfile } from "@/lib/data-service";
import { variantUrl } from "@/lib/image-variants";

const InitialLoader = dynamic(() =>
  import("@/components/initial-loader").then((m) => m.InitialLoader)
);

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name = profile?.name || "Al Fitra Nur Ramadhani";
  const logoUrl = profile?.logo_url || "/favicon.ico";
  // Varian kecil untuk favicon/apple-icon (URL non-varian dikembalikan apa adanya)
  const iconUrl = variantUrl(logoUrl, 128);
  const appleIconUrl = variantUrl(logoUrl, 256);

  return {
    title: {
      template: `%s | ${name}`,
      default: `${name} | Data Science Portfolio`,
    },
    description: "Professional portfolio showcasing data analytics, visualization, artificial intelligence, and web development projects.",
    keywords: ["Data Science", "Data Analyst", "Machine Learning", "Python", "SQL", "Tableau", "PowerBI", "Portfolio"],
    icons: {
      icon: [
        { url: iconUrl },
        { url: iconUrl, sizes: "32x32" },
        { url: iconUrl, sizes: "16x16" }
      ],
      shortcut: iconUrl,
      apple: [
        { url: appleIconUrl, sizes: "180x180" }
      ]
    }
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfile();

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground font-sans relative flex">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <InitialLoader />
          <ScrollToTop />
          <VisitorTracker />
          <TopLoader />
          {/* Background Ambient Glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[10%] left-[5%] ambient-glow bg-neutral-400/20 dark:bg-neutral-400/10" />
            <div className="absolute bottom-[15%] right-[5%] ambient-glow bg-neutral-500/20 dark:bg-neutral-500/10" />
          </div>

          {/* Main Layout Container */}
          <MainLayoutContainer>
            {/* Persistent Sidebar */}
            <Sidebar profile={profile} />

            {/* Admin Sidebar (code-split, chunk only loads on /admin routes) */}
            <AdminSidebarSlot />

            {/* Content Wrapper */}
            <div className="flex-1 w-full min-w-0 flex flex-col min-h-screen">
              <main className="flex-grow w-full pt-20 lg:pt-8 pb-6 relative z-10 overflow-x-hidden flex flex-col">
                {children}
              </main>
            </div>
          </MainLayoutContainer>
        </ThemeProvider>
      </body>
    </html>
  );
}
