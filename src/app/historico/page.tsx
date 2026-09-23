"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRequireAuth } from "@/lib/use-require-auth";
import AppHeader from "@/components/AppHeader";

type Presenca = {
  id: string;
  registrado_em: string;
};

export default function HistoricoPage() {
  const { user, loading } = useRequireAuth();
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("presencas")
      .select("id, registrado_em")
      .eq("aluno_id", user.id)
      .order("registrado_em", { ascending: false })
      .then(({ data }) => {
        setPresencas(data ?? []);
        setCarregando(false);
      });
  }, [user]);

  if (loading || !user) {
    return <main className="flex-1 flex items-center justify-center text-sm text-[#8C9AB8]">Carregando...</main>;
  }

  return (
    <main className="flex-1 flex flex-col">
      <AppHeader subtitle="Conecta Estudante" title="Histórico de presença" />

      <div className="flex-1 px-5 py-6 flex flex-col gap-4 max-w-sm w-full mx-auto">
        <div className="text-xs text-[#8C9AB8]">
          {presencas.length} registro{presencas.length !== 1 ? "s" : ""} no total
        </div>

        <div className="bg-white rounded-2xl border border-[#E1E7F2] divide-y divide-[#EEF1F7]">
          {carregando && <div className="px-4 py-4 text-xs text-[#8C9AB8]">Carregando...</div>}
          {!carregando && presencas.length === 0 && (
            <div className="px-4 py-4 text-xs text-[#8C9AB8]">Nenhuma presença registrada ainda.</div>
          )}
          {presencas.map((p) => (
            <div key={p.id} className="px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E4F7F3] flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#17B26A" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-[#14213D]">
                  {new Date(p.registrado_em).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </div>
              </div>
              <span className="text-xs font-bold text-[#17B26A]">
                {new Date(p.registrado_em).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>

        <Link href="/dashboard" className="text-xs font-semibold text-[#1B6FC9] text-center">
          ← Voltar ao início
        </Link>
      </div>
    </main>
  );
}
