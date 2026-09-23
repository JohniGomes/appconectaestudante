"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="bg-[#14213D] px-5 py-5 flex items-center justify-between rounded-b-3xl">
      <div>
        {subtitle && <div className="text-[#9FB3D9] text-[11px] font-bold">{subtitle}</div>}
        <div className="text-white text-lg font-extrabold">{title}</div>
      </div>
      <button
        onClick={handleLogout}
        className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
        aria-label="Sair"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      </button>
    </header>
  );
}
