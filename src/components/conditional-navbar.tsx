"use client";

import { usePathname } from "next/navigation";
import GlobalNavbar from "@/components/global-navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Don't show global navbar on products page (it has its own)
  if (pathname?.startsWith('/products')) {
    return null;
  }
  
  return <GlobalNavbar />;
}
