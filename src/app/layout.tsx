import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TanstackClientProvider } from "@/components/providers/tanstack-client-provider";
import { Toaster } from "@/components/ui/sonner";
import { RefreshUserProvider } from "@/components/providers/refresh-user-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskSync",
  description:
    "TaskSync is a task management app that helps you manage your tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TanstackClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <RefreshUserProvider>
              <ScrollArea className="h-screen w-screen">{children}</ScrollArea>
            </RefreshUserProvider>
            <Toaster position="bottom-right" richColors />
          </ThemeProvider>
        </TanstackClientProvider>
      </body>
    </html>
  );
}
