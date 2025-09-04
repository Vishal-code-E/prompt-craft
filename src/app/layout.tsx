import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

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
          {children}
        </Providers>

      </body>
    </html>
  );
}
