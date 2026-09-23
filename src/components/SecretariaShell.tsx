"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconGrid({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconUsers({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.3 3-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
      <path d="M16 8.2a3 3 0 110 5.9" />
      <path d="M18.5 14.8c2.4.4 3.8 2 3.8 4.2" />
    </svg>
  );
}

function IconAlert({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
    </svg>
  );
}

function IconEdit({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

function IconMegaphone({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M3 11v2a2 2 0 002 2h1l3 5V4l-3 5H5a2 2 0 00-2 2z" />
      <path d="M13 8a4 4 0 010 8" />
      <path d="M17 5a8 8 0 010 14" />
    </svg>
  );
}

const ITEMS = [
  { href: "/secretaria", label: "Dashboard", Icon: IconGrid },
  { href: "/secretaria/alunos", label: "Alunos", Icon: IconUsers },
  { href: "/secretaria/evasao", label: "Evasão", Icon: IconAlert },
  { href: "/secretaria/notas", label: "Lançar notas", Icon: IconEdit },
  { href: "/secretaria/comunicados", label: "Comunicados", Icon: IconMegaphone },
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
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                active ? "bg-[#14213D] text-white" : "bg-white border border-[#E1E7F2] text-[#6B7A99]"
              }`}
            >
              <Icon color={active ? "#fff" : "#6B7A99"} />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto px-5 py-6">{children}</div>
    </main>
  );
}
