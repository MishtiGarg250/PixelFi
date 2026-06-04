import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/providers/query-provider";
import { ClerkAxiosProvider } from "@/providers/clerk-axios-provider";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PixelFi",
  description: "Wealth management webapp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${poppins.className} antialiased`}>
          <QueryProvider>
            <ClerkAxiosProvider>
              {children}
              <Toaster theme="dark" richColors position="top-right" />
            </ClerkAxiosProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
