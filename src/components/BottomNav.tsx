"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={active ? "#1B6FC9" : "#A3AFC7"} strokeWidth="2">
      <path d="M3 11.5L12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function IconBook({ active }: { active: boolean }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={active ? "#1B6FC9" : "#A3AFC7"} strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function IconBell({ active }: { active: boolean }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={active ? "#1B6FC9" : "#A3AFC7"} strokeWidth="2">
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 01-3.4 0" />
    </svg>
  );
}

function IconBus({ active }: { active: boolean }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={active ? "#1B6FC9" : "#A3AFC7"} strokeWidth="2">
      <path d="M3 12h18M3 12l4-6h10l4 6M3 12v6h3m12-6v6h-3M8 18a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  );
}

function IconUser({ active }: { active: boolean }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={active ? "#1B6FC9" : "#A3AFC7"} strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

const ITEMS = [
  { href: "/dashboard", label: "Início", Icon: IconHome },
  { href: "/notas", label: "Boletim", Icon: IconBook },
  { href: "/comunicados", label: "Avisos", Icon: IconBell },
  { href: "/rota", label: "Rota", Icon: IconBus },
  { href: "/perfil", label: "Perfil", Icon: IconUser },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 bg-white border-t border-[#EEF1F7] px-2 py-2 flex justify-around max-w-sm w-full mx-auto">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 px-2 py-1 text-[10px] font-bold ${
              active ? "text-[#1B6FC9]" : "text-[#A3AFC7]"
            }`}
          >
            <Icon active={active} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
