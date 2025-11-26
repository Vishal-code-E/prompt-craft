"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";

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

export default function GlobalNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ helper to gate actions behind login
  const handleProtectedAction = (callback: () => void) => {
    if (!session) {
      signIn("google");
    } else {
      callback();
    }
  };

  const navItems = [
    { name: "Home", link: "/#home" },
    { name: "About", link: "/about" },
    { name: "Products", link: "/products" },
    { name: "Playground", link: "/playground" },
    { name: "Library", link: "/library" },
    { name: "Docs", link: "/docs" },
    { name: "Pricing", link: "/pricing" },
    { name: "Contact", link: "/contact" },
  ];

  return (
    <Navbar>
      {/* Desktop Navbar */}
      <NavBody isScrolled={isScrolled}>
        <AnimatePresence mode="wait">
          {!isScrolled && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <NavbarLogo />
            </motion.div>
          )}
        </AnimatePresence>
        <NavItems
          items={navItems.map((item) => ({
            ...item,
            className: "font-bold",
          }))}
        />
        <AnimatePresence mode="wait">
          {!isScrolled && (
            <motion.div
              key="button"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <NavbarButton
                onClick={() =>
                  handleProtectedAction(() => {
                    window.location.href = "/demo";
                  })
                }
              >
                Book a Demo
              </NavbarButton>
            </motion.div>
          )}
        </AnimatePresence>
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
  );
}
