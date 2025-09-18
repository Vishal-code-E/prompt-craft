import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

import GlobalNavbar from "@/components/global-navbar";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Prompt Craft",
  description: "Craft better prompts with AI-powered assistance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased">
        <Providers>
          {/* ✅ Global Navbar across all pages */}
          <GlobalNavbar />

          <div className="relative z-10 flex flex-col min-h-screen">
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
