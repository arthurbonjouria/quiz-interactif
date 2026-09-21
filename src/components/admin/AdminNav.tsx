"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Tableau de bord", emoji: "🏠" },
  { href: "/admin/questionnaires", label: "Questionnaires", emoji: "📚" },
  { href: "/admin/campaigns", label: "Campagnes", emoji: "🎯" },
  { href: "/admin/folders", label: "Dossiers", emoji: "📁" },
  { href: "/admin/companies", label: "Entreprises", emoji: "🏢" },
  { href: "/admin/participants", label: "Participants", emoji: "👥" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto whitespace-nowrap px-4 text-sm sm:mx-0 sm:gap-1.5 sm:overflow-visible sm:px-0">
      {NAV.map((item) => {
        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 font-medium transition ${
              isActive ? "bg-ink text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-ink"
            }`}
          >
            <span className="mr-1.5">{item.emoji}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
