import type { Metadata, Viewport } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { VisitorTracker } from "@/components/visitor-tracker";
import NextTopLoader from 'nextjs-toploader';
import { InitialLoader } from "@/components/initial-loader";
import { ScrollToTop } from "@/components/scroll-to-top";
import { getProfile } from "@/lib/data-service";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name = profile?.name || "Al Fitra Nur Ramadhani";
  const logoUrl = profile?.logo_url || "/favicon.ico";

  return {
    title: {
      template: `%s | ${name}`,
      default: `${name} | Data Science Portfolio`,
    },
    description: "Professional portfolio showcasing data analytics, visualization, artificial intelligence, and web development projects.",
    keywords: ["Data Science", "Data Analyst", "Machine Learning", "Python", "SQL", "Tableau", "PowerBI", "Portfolio"],
    icons: {
      icon: [
        { url: logoUrl },
        { url: logoUrl, sizes: "32x32" },
        { url: logoUrl, sizes: "16x16" }
      ],
      shortcut: logoUrl,
      apple: [
        { url: logoUrl, sizes: "180x180" }
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
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <InitialLoader />
          <ScrollToTop />
          <VisitorTracker />
          <NextTopLoader
            color="#38bdf8"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #38bdf8,0 0 5px #38bdf8"
          />
          {/* Background Ambient Glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[10%] left-[5%] ambient-glow bg-cyan-500/20 dark:bg-cyan-500/10" />
            <div className="absolute bottom-[15%] right-[5%] ambient-glow bg-violet-500/20 dark:bg-violet-500/10" />
          </div>
          
          {/* Main Layout Container */}
          <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-8 relative z-10 flex flex-col lg:flex-row gap-6 min-h-screen">
            {/* Persistent Sidebar */}
            <Sidebar profile={profile} />
            
            {/* Admin Sidebar */}
            <AdminSidebar />

            {/* Content Wrapper */}
            <div className="flex-1 w-full min-w-0 flex flex-col min-h-screen">
              <main className="flex-grow w-full pt-20 lg:pt-8 pb-6 relative z-10 overflow-x-hidden">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
