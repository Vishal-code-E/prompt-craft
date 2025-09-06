"use client";
import HeroSectionOne from "@/components/hero-section-demo-1";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/resizable-navbar";
import React, { useState } from "react";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/magicui/terminal";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Footer from "@/components/footer";
import dynamic from "next/dynamic";
const AboutPage = dynamic(() => import("./Pages/About/page"));

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

  const navItems = [
    { name: "Home", link: "/#home" },
    { name: "About", link: "/about/page" },
    { name: "Products", link: "/products" },
    { name: "Docs", link: "/docs" },
    { name: "Pricing", link: "/pricing" },
    { name: "Contact", link: "/contact" },
  ];

  return (
    <>
      <Navbar>
        {/* Desktop Navbar */}
        <NavBody>
          <NavbarLogo />
          <NavItems
            items={navItems.map((item) => ({
              ...item,
              className: "font-bold",
            }))}
          />
          {/* ✅ Protected Book a Demo */}
          <NavbarButton
            onClick={() =>
              handleProtectedAction(() => {
                // redirect to your demo page
                window.location.href = "/demo";
              })
            }
          >
            Book a Demo
          </NavbarButton>
        </NavBody>

        {/* Mobile Navbar */}
        <MobileNav visible>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isOpen}
              onClick={() => setIsOpen((prev) => !prev)}
            />
          </MobileNavHeader>

          <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
            {navItems.map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                className="w-full px-4 py-2 text-black text-lg"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            ))}

            {/* ✅ Protected Book a Demo (Mobile) */}
            <NavbarButton
              className="mt-4 w-full"
              onClick={() =>
                handleProtectedAction(() => {
                  window.location.href = "/demo";
                })
              }
            >
              Book a Demo
            </NavbarButton>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

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

      {/* Hero Section One below */}
      <HeroSectionOne />

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
