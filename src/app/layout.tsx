import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";

import GlobalNavbar from "@/components/global-navbar";
import Footer from "@/components/footer";
import ClickSpark from "@/components/ClickSpark";

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
      <body className="bg-white text-black antialiased" suppressHydrationWarning={true}>
        <Providers>
          <WorkspaceProvider>
            <ClickSpark
              sparkColor="#00FF88"
              sparkSize={12}
              sparkRadius={20}
              sparkCount={10}
              duration={500}
              easing="ease-out"
            >
              <div className="min-h-screen">
                {/* ✅ Global Navbar across all pages */}
                <GlobalNavbar />

                <div className="relative z-10 flex flex-col min-h-screen">
                  <main className="grow">{children}</main>
                  <Footer />
                </div>
              </div>
            </ClickSpark>
          </WorkspaceProvider>
        </Providers>
      </body>
    </html>
  );
}
