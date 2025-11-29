"use client";

import { usePathname } from "next/navigation";
import GlobalNavbar from "@/components/global-navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  
  if (pathname?.startsWith('/products')) {
    return null;
  }
  
  return <GlobalNavbar />;
}
