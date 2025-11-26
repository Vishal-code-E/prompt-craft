"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, LogOut, Settings, Building2 } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import Image from "next/image";

import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
} from "@/components/resizable-navbar";

export default function ProductsNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session } = useSession();
  const { currentWorkspace, workspaces, switchWorkspace } = useWorkspace();

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
      setShowWorkspaceMenu(false);
      setShowUserMenu(false);
    };
    if (showWorkspaceMenu || showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showWorkspaceMenu, showUserMenu]);

  const navItems = [
    { name: "Home", link: "/" },
    { name: "Playground", link: "/playground" },
    { name: "Products", link: "/products" },
    { name: "Docs", link: "/docs" },
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
          {/* Workspace Switcher - Only in Products */}
          {session && currentWorkspace && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowWorkspaceMenu(!showWorkspaceMenu);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Building2 className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{currentWorkspace.name}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showWorkspaceMenu && workspaces.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => {
                        switchWorkspace(workspace.id);
                        setShowWorkspaceMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                        workspace.id === currentWorkspace.id ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="font-medium text-sm">{workspace.name}</div>
                      <div className="text-xs text-gray-500">{workspace.plan} · {workspace.role}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* User Menu */}
          {session?.user && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {session.user.image && (
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name || 'User'} 
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="max-w-[120px] truncate">{session.user.name || session.user.email}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="font-medium text-sm">{session.user.name}</div>
                    <div className="text-xs text-gray-500">{session.user.email}</div>
                  </div>
                  <a
                    href="/settings/account"
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
          )}
          
          {/* Sign In Button */}
          {!session && (
            <NavbarButton onClick={() => signIn("google")}>
              Sign In
            </NavbarButton>
          )}
        </div>
      </NavBody>
    </Navbar>
  );
}
