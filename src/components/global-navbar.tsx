"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

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
  const { data: session } = useSession();

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
      <NavBody>
        <NavbarLogo />
        <NavItems
          items={navItems.map((item) => ({
            ...item,
            className: "font-bold",
          }))}
        />
        <NavbarButton
          onClick={() =>
            handleProtectedAction(() => {
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
