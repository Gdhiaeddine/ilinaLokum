"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconFactory } from "@/shared/icon-factory";
import { cn } from "@/shared/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "Dashboard" as const },
  { href: "/sales", label: "Ventes", icon: "Sales" as const },
  { href: "/purchases", label: "Achats", icon: "Purchases" as const },
  { href: "/products", label: "Produits", icon: "Products" as const },
  { href: "/recipes", label: "Recettes", icon: "Recipes" as const },
  { href: "/suppliers", label: "Fournisseurs", icon: "Suppliers" as const },
  { href: "/ingredients", label: "Ingrédients", icon: "Ingredients" as const },
  { href: "/reports", label: "Rapports", icon: "Reports" as const },
  { href: "/settings", label: "Paramètres", icon: "Settings" as const },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 bg-[#FAF3EB] border-r border-[#E8D5C4] transition-all duration-300 hidden lg:flex flex-col w-72"
    >
      <div className="flex items-center justify-between p-6 border-b border-[#E8D5C4]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center flex-shrink-0">
            <IconFactory name="Store" className="text-white" size={20} />
          </div>
          <span className="font-serif text-lg font-semibold text-[#2C2419]">
            Kunafa
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-[#C9A227]/10 to-transparent text-[#A67C00] font-medium border-l-2 border-[#C9A227]"
                  : "text-[#6B4F3A] hover:bg-[#F5E9DA] hover:text-[#2C2419]"
              )}
            >
              <IconFactory
                name={item.icon}
                size={20}
                className={cn(
                  "transition-colors",
                  isActive ? "text-[#C9A227]" : "text-[#8C735A] group-hover:text-[#C9A227]"
                )}
              />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#E8D5C4]">
        <button className="flex items-center gap-3 px-4 py-3 text-[#6B4F3A] hover:text-[#C9A227] hover:bg-[#F5E9DA] rounded-xl transition-all w-full">
          <IconFactory name="Logout" size={20} />
          <span className="text-sm">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
