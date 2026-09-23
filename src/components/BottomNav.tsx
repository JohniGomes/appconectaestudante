"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Início" },
  { href: "/notas", label: "Boletim" },
  { href: "/comunicados", label: "Avisos" },
  { href: "/rota", label: "Rota" },
  { href: "/perfil", label: "Perfil" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 bg-white border-t border-[#EEF1F7] px-2 py-2 flex justify-around max-w-sm w-full mx-auto">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-2 py-1 text-[10px] font-bold ${
              active ? "text-[#1B6FC9]" : "text-[#A3AFC7]"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${active ? "bg-[#1B6FC9]" : "bg-transparent"}`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
