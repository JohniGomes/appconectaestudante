"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/secretaria", label: "Dashboard" },
  { href: "/secretaria/alunos", label: "Alunos" },
  { href: "/secretaria/evasao", label: "Evasão" },
  { href: "/secretaria/notas", label: "Lançar notas" },
  { href: "/secretaria/comunicados", label: "Comunicados" },
];

export default function SecretariaShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="flex-1 flex flex-col">
      <div className="bg-[#14213D] px-5 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-[#9FB3D9] text-[10px] font-bold tracking-wide">
              VISÃO DA SECRETARIA (DEMO)
            </div>
            <div className="text-white text-lg font-extrabold">{title}</div>
            {subtitle && <div className="text-[#9FB3D9] text-xs mt-0.5">{subtitle}</div>}
          </div>
          <Link
            href="/dashboard"
            className="text-[10px] font-bold text-[#9FB3D9] bg-white/10 px-3 py-1.5 rounded-full"
          >
            ← App do aluno
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-5 pt-4 flex gap-2 flex-wrap">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                active ? "bg-[#14213D] text-white" : "bg-white border border-[#E1E7F2] text-[#6B7A99]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto px-5 py-6">{children}</div>
    </main>
  );
}
