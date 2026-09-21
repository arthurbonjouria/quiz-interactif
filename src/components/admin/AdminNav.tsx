"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Target, FolderOpen, Building2, Users, UserCog } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/questionnaires", label: "Questionnaires", icon: BookOpen },
  { href: "/admin/campaigns", label: "Campagnes", icon: Target },
  { href: "/admin/folders", label: "Dossiers", icon: FolderOpen },
  { href: "/admin/companies", label: "Entreprises", icon: Building2 },
  { href: "/admin/participants", label: "Participants", icon: Users },
];

export function AdminNav({ isOwner = false }: { isOwner?: boolean }) {
  const pathname = usePathname();
  const items = isOwner ? [...NAV, { href: "/admin/team", label: "Équipe", icon: UserCog }] : NAV;

  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto whitespace-nowrap px-4 text-sm sm:mx-0 sm:gap-1.5 sm:overflow-visible sm:px-0">
      {items.map((item) => {
        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
              isActive ? "bg-ink text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-ink"
            }`}
          >
            <Icon size={16} strokeWidth={2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
