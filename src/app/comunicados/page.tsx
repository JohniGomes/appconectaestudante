"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRequireAuth } from "@/lib/use-require-auth";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

type Comunicado = {
  id: string;
  titulo: string;
  mensagem: string;
  turma: string;
  autor: string;
  criado_em: string;
};

export default function ComunicadosPage() {
  const { user, loading } = useRequireAuth();
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("comunicados")
      .select("id, titulo, mensagem, turma, autor, criado_em")
      .order("criado_em", { ascending: false })
      .then(({ data }) => {
        setComunicados(data ?? []);
        setCarregando(false);
      });
  }, [user]);

  if (loading || !user) {
    return <main className="flex-1 flex items-center justify-center text-sm text-[#8C9AB8]">Carregando...</main>;
  }

  return (
    <main className="flex-1 flex flex-col">
      <AppHeader subtitle="Conecta Estudante" title="Comunicados" />

      <div className="flex-1 px-5 py-6 flex flex-col gap-3 max-w-sm w-full mx-auto">
        {carregando && <div className="text-xs text-[#8C9AB8]">Carregando...</div>}

        {!carregando && comunicados.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E1E7F2] p-5 text-center">
            <div className="text-sm font-bold text-[#14213D]">Nenhum comunicado ainda</div>
            <div className="text-xs text-[#8C9AB8] mt-1">
              Avisos da secretaria aparecem aqui.
            </div>
          </div>
        )}

        {comunicados.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-[#E1E7F2] p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-[#14213D]">{c.titulo}</span>
              <span className="text-[10px] font-semibold text-[#1B6FC9] bg-[#EAF1FC] px-2 py-0.5 rounded-full">
                {c.turma}
              </span>
            </div>
            <p className="text-xs text-[#6B7A99] leading-relaxed">{c.mensagem}</p>
            <div className="text-[10px] text-[#A3AFC7] mt-2">
              {c.autor} ·{" "}
              {new Date(c.criado_em).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </main>
  );
}
