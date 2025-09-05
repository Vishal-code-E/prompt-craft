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
    { name: "About", link: "/about" },
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
      <HeroSectionOne />

      {/* Terminal Section */}
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
