"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconFactory } from "@/shared/icon-factory";
import { cn } from "@/shared/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "Dashboard" as const },
  { href: "/sales", label: "Ventes", icon: "Sales" as const },
  { href: "/purchases", label: "Achats", icon: "Purchases" as const },
  { href: "/products", label: "Produits", icon: "Products" as const },
  { href: "/suppliers", label: "Fournisseurs", icon: "Suppliers" as const },
  { href: "/reports", label: "Rapports", icon: "Reports" as const },
  { href: "/settings", label: "Paramètres", icon: "Settings" as const },
];

interface TopbarProps {
  userEmail: string;
}

export function Topbar({ userEmail }: TopbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="h-16 bg-[#FAF3EB]/80 backdrop-blur-md border-b border-[#E8D5C4] flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-[#6B4F3A] hover:text-[#C9A227] hover:bg-[#F5E9DA] rounded-xl transition-all"
          >
            <IconFactory name="Menu" size={20} />
          </button>
          <div className="relative max-w-md hidden sm:block">
            <IconFactory
              name="Search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C735A]"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-[#FFFDF9] border border-[#E8D5C4] rounded-xl text-sm text-[#2C2419] placeholder:text-[#8C735A]/60 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-[#6B4F3A] hover:text-[#C9A227] hover:bg-[#F5E9DA] rounded-xl transition-all">
            <IconFactory name="Bell" size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#C9A227] rounded-full" />
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-[#E8D5C4]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center">
              <IconFactory name="User" className="text-white" size={18} />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-[#2C2419]">{userEmail}</p>
              <p className="text-xs text-[#8C735A]">Administrateur</p>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#FAF3EB] border-r border-[#E8D5C4] flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#E8D5C4]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center">
                  <IconFactory name="Store" className="text-white" size={20} />
                </div>
                <span className="font-serif text-lg font-semibold text-[#2C2419]">Kunafa</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-[#6B4F3A] hover:text-[#C9A227] rounded-lg">
                <IconFactory name="Close" size={20} />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-[#C9A227]/10 to-transparent text-[#A67C00] font-medium border-l-2 border-[#C9A227]"
                        : "text-[#6B4F3A] hover:bg-[#F5E9DA] hover:text-[#2C2419]"
                    )}
                  >
                    <IconFactory
                      name={item.icon}
                      size={20}
                      className={cn(isActive ? "text-[#C9A227]" : "text-[#8C735A]")}
                    />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
