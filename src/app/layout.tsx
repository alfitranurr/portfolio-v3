import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import NextTopLoader from 'nextjs-toploader';
import { InitialLoader } from "@/components/initial-loader";
import { ScrollToTop } from "@/components/scroll-to-top";
import { getProfile } from "@/lib/data-service";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Al Fitra Nur Ramadhani",
    default: "Al Fitra Nur Ramadhani | Data Science Portfolio",
  },
  description: "Professional portfolio showcasing data analytics, visualization, artificial intelligence, and web development projects.",
  keywords: ["Data Science", "Data Analyst", "Machine Learning", "Python", "SQL", "Tableau", "PowerBI", "Portfolio"],
};

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
          
          {/* Persistent Sidebar */}
          <Sidebar profile={profile} />
          
          {/* Admin Sidebar */}
          <AdminSidebar />

          {/* Content Wrapper */}
          <div className="flex-1 w-full flex flex-col min-h-screen">
            {/* Desktop padding-left to leave space for the sidebar (w-64 = 16rem + spacing) */}
            {/* Mobile padding-top for the fixed mobile header (h-16 = 4rem + spacing) */}
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 md:px-8 lg:pl-72 lg:pr-8 pt-20 lg:pt-8 relative z-10">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
