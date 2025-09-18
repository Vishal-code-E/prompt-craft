"use client";
import HeroSectionOne from "@/components/hero-section-demo-1";

import React, { useState } from "react";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/magicui/terminal";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Footer from "@/components/footer";



// ✅ NEW IMPORTS
import { useSession, signIn } from "next-auth/react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ get current session
  const { data: session } = useSession();

  // ✅ helper to gate actions behind login
  const handleProtectedAction = (callback: () => void) => {
    if (!session) {
      signIn("google"); // open Google login if not signed in
    } else {
      callback();
    }
  };

  return (
    <>
      {/* Hero Section */}
      {/* Hero Section One below */}
      <HeroSectionOne />

      {/* Terminal + Side Text Section */}
      <div className="flex flex-col md:flex-row-reverse items-center gap-8 w-full mt-8">
        {/* Terminal Section (Left) */}
        <div className="w-full md:w-2/3 md:pl-12">
          <Terminal>
            <TypingAnimation>&gt; pnpm dlx prompt-craft@latest init</TypingAnimation>

            <AnimatedSpan className="text-green-500">
              ✔ Initializing Prompt Craft Labs...
            </AnimatedSpan>
            <AnimatedSpan className="text-green-500">
              ✔ Setting up workspace: /prompts
            </AnimatedSpan>
            <AnimatedSpan className="text-green-500">
              ✔ Generating template: content.json
            </AnimatedSpan>
            <AnimatedSpan className="text-green-500">
              ✔ Generating template: website.json
            </AnimatedSpan>
            <AnimatedSpan className="text-green-500">
              ✔ Generating template: database.json
            </AnimatedSpan>

            <TypingAnimation className="text-muted-foreground">
              ✅ Success! Your Prompt Lab is ready. Edit /prompts/*.json to craft
              and export.
            </TypingAnimation>
          </Terminal>
        </div>
        {/* Side Text Section (Right) */}
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center text-center">
          <h3 className="text-2xl font-bold mb-2">Why PromptCraft?</h3>
          <p className="text-gray-600">
        Build, test, and export structured prompts for your apps and workflows.<br />
        <span className="text-green-500 font-semibold">Fast. Flexible. JSON-powered.</span>
          </p>
        </div>
      </div>

      {/* Scroll Animation Section */}
      <ContainerScroll
        titleComponent={
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            PromptCraft Labs <br />
            <span className="text-black">
              Generate <span className="text-green-400">JSON</span>-driven
              prompts for content, websites &amp; DBs
            </span>
          </h2>
        }
      >
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
          <p className="text-lg text-gray-300">
            A playground where prompts become structured workflows.
          </p>
          <p className="text-md text-gray-400">
            Export as JSON, integrate directly into your stack.
          </p>
        </div>
      </ContainerScroll>

      <Footer />
    </>
  );
}
