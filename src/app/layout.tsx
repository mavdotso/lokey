import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/header";
import ConvexClientProvider from "@/lib/providers/convex-client-provider";
import { auth } from "@/lib/auth";

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
      <body className={inter.className}>
        <ConvexClientProvider session={session}>
          <div className="flex flex-col mx-auto max-w-2xl min-h-screen container">
            <Header />
            <main className="flex-grow">{children}</main>
          </div>
        </ConvexClientProvider>
        <Toaster />
      </body>
    </html>
  );
}