import type React from "react";
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { ViewportProvider } from "@/lib/hooks/use-viewport";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/lib/errors/boundaries/ErrorBoundary";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Boards",
  description: "Create beautiful boards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${jakarta.variable} font-sans`}>
        <ErrorBoundary>
          <SupabaseProvider>
            <ViewportProvider>{children}</ViewportProvider>
          </SupabaseProvider>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
