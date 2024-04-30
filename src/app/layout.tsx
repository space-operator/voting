import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query";
import { ErrorBoundary } from "react-error-boundary";
import { GlobalError } from "@/components/global-error";
import JotaiProvider from "@/providers/jotai-store";
import { Suspense } from "react";
import { ClusterProvider } from "@/providers/cluster";
import { WalletContextProvider } from "@/providers/wallet";
import { ThemeProvider } from "@/providers/theme";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Space Operator - Voting UI",
  description: "Realm Vote Aggregator",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <ErrorBoundary fallbackRender={GlobalError}>
          <Suspense fallback={<div>Loading...</div>}>
            <ClusterProvider>
              <JotaiProvider>
                <QueryProvider>
                  <WalletContextProvider>
                    <ThemeProvider
                      attribute="class"
                      defaultTheme="system"
                      enableSystem
                      disableTransitionOnChange
                    >
                      {children}
                      <Toaster />
                    </ThemeProvider>
                  </WalletContextProvider>
                </QueryProvider>
              </JotaiProvider>
            </ClusterProvider>
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  );
}
