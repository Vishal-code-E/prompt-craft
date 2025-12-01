"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, LogOut, Settings } from "lucide-react";

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
import { CreditProgressBar } from "@/components/CreditProgressBar";

export default function GlobalNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session } = useSession();

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
    };
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

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
        
        <div className="flex items-center gap-3">
          {/* User Menu */}
          {session && (
            <>
              <CreditProgressBar />
              
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#00FF88] flex items-center justify-center text-xs font-bold">
                      {session.user.name?.[0] || session.user.email?.[0]}
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>
              
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="font-medium text-sm">{session.user.name}</div>
                    <div className="text-xs text-gray-500">{session.user.email}</div>
                  </div>
                  <a
                    href="/settings/account"
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </a>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
              </div>
            </>
          )}
          
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
        </div>
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
