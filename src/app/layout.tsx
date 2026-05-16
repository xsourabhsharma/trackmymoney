import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: 'TrackMyMoney | AI-Powered Personal Finance Tracker',
    template: '%s | TrackMyMoney',
  },
  description: 'Track expenses, manage budgets, set savings goals, and get AI-powered financial insights. Upload receipts, parse bank statements, and take control of your money.',
  keywords: ['finance tracker', 'expense tracker', 'budget planner', 'savings goals', 'AI finance', 'receipt scanner', 'personal finance'],
  authors: [{ name: 'TrackMyMoney' }],
  openGraph: {
    title: 'TrackMyMoney | AI-Powered Personal Finance Tracker',
    description: 'Track expenses, manage budgets, set savings goals, and get AI-powered financial insights.',
    url: '/',
    siteName: 'TrackMyMoney',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrackMyMoney | AI-Powered Personal Finance Tracker',
    description: 'Track expenses, manage budgets, set savings goals, and get AI-powered financial insights.',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    title: 'TrackMyMoney',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1C1B19',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased transition-colors duration-500`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
