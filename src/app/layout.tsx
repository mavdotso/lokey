import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ConvexClientProvider from "@/lib/providers/convex-client-provider";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/lib/providers/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lokey — Secure Password Sharing With Superpowers",
  description: "Share passwords, credentials and other sensitive information securely with one-time links. Lokey provides a simple, encrypted way to transmit sensitive information.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={cn('min-h-screen', inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <ConvexClientProvider session={session}>
            <main>{children}</main>
          </ConvexClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}