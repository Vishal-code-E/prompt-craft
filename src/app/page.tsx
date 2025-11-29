"use client";
import HeroSectionOne from "@/components/hero-section-demo-1";

import React, { useState } from "react";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/magicui/terminal";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";




import { useSession, signIn } from "next-auth/react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);


  const { data: session } = useSession();


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
        <div className="w-full md:w-2/3 mr-auto pl-8 pr-40">
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
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center text-center ml-auto pr-4 pl-24">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Why <span className="text-[#00FF88] drop-shadow-[1px_1px_2px_rgba(0,0,0,0.6)]">PromptCraft</span>?
          </h3>
          <TextGenerateEffect
            words="Build, test, and export structured prompts for your apps and workflows. Fast. Flexible."
            className="text-lg md:text-xl text-gray-700"
            duration={0.8}
          />
          <p className="mt-3 text-lg md:text-xl font-semibold">
            <span className="text-[#00FF88] drop-shadow-[1px_1px_2px_rgba(0,0,0,0.6)]">JSON</span>-powered.
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
    </>
  );
}
