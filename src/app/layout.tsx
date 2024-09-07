import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ConvexClientProvider from "@/lib/providers/convex-client-provider";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

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
      <body className={cn('min-h-screen', GeistSans.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <ConvexClientProvider session={session}>
            <TooltipProvider>
              <main>{children}</main>
            </TooltipProvider>
          </ConvexClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}