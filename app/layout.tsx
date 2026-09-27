import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yelson Ops | Operations Dashboard Demo",
  description:
    "Explore orders, revenue, margins, and fulfilment in an interactive operations dashboard built with Next.js and TypeScript using synthetic data.",
  openGraph: {
    title: "Yelson Ops | Operations Dashboard Demo",
    description:
      "A portfolio demo for exploring operational KPIs, charts, and orders using synthetic data.",
    url: "https://yelson-ops-dashboard-vercel.vercel.app",
    siteName: "Yelson Ops",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
