import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Mileage Tracker",
  description: "Track your fuel consumption and expenses across multiple vehicles",
  viewport: "width=device-width, initial-scale=1",
  keywords: ["fuel", "mileage", "tracker", "vehicle", "consumption", "expenses"],
  authors: [{ name: "Fuel Tracker Team" }],
  openGraph: {
    title: "Mileage Tracker",
    description: "Track your fuel consumption and expenses across multiple vehicles",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mileage Tracker",
    description: "Track your fuel consumption and expenses across multiple vehicles",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col">
        <Providers>
          <div className="flex-1">
            {children}
          </div>
          <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
                <div className="text-center sm:text-left">
                  © {currentYear} Mileage Tracker. All rights reserved.
                </div>
                <div className="text-center sm:text-right">
                  Created by Rasel Ahmed
                </div>
              </div>
            </div>
          </footer>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
