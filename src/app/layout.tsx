import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";

import ConditionalNavbar from "@/components/conditional-navbar";
import Footer from "@/components/footer";
import ClickSpark from "@/components/ClickSpark";
import { LowCreditAlertBanner } from "@/components/LowCreditAlertBanner";

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
                {/* Low Credit Alert Banner */}
                <LowCreditAlertBanner />
                
                {/* Conditional Navbar - hides on products page */}
                <ConditionalNavbar />

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
