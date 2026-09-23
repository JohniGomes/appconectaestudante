"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRequireAuth } from "@/lib/use-require-auth";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

type Nota = {
  id: string;
  disciplina: string;
  avaliacao: string;
  nota: number;
  criado_em: string;
};

export default function NotasPage() {
  const { user, loading } = useRequireAuth();
  const [notas, setNotas] = useState<Nota[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("notas")
      .select("id, disciplina, avaliacao, nota, criado_em")
      .eq("aluno_id", user.id)
      .order("criado_em", { ascending: false })
      .then(({ data }) => {
        setNotas(data ?? []);
        setCarregando(false);
      });
  }, [user]);

  if (loading || !user) {
    return <main className="flex-1 flex items-center justify-center text-sm text-[#8C9AB8]">Carregando...</main>;
  }

  const porDisciplina = notas.reduce<Record<string, Nota[]>>((acc, n) => {
    acc[n.disciplina] = acc[n.disciplina] ?? [];
    acc[n.disciplina].push(n);
    return acc;
  }, {});

  return (
    <main className="flex-1 flex flex-col">
      <AppHeader subtitle="Conecta Estudante" title="Boletim" />

      <div className="flex-1 px-5 py-6 flex flex-col gap-5 max-w-sm w-full mx-auto">
        {carregando && <div className="text-xs text-[#8C9AB8]">Carregando...</div>}

        {!carregando && notas.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E1E7F2] p-5 text-center">
            <div className="text-sm font-bold text-[#14213D]">Nenhuma nota lançada ainda</div>
            <div className="text-xs text-[#8C9AB8] mt-1">
              As notas aparecem aqui assim que forem lançadas pela secretaria.
            </div>
          </div>
        )}

        {Object.entries(porDisciplina).map(([disciplina, itens]) => (
          <div key={disciplina}>
            <div className="text-sm font-bold text-[#14213D] mb-2">{disciplina}</div>
            <div className="bg-white rounded-2xl border border-[#E1E7F2] divide-y divide-[#EEF1F7]">
              {itens.map((n) => (
                <div key={n.id} className="px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-[#14213D]">{n.avaliacao}</span>
                  <span
                    className={`text-sm font-extrabold ${
                      n.nota >= 6 ? "text-[#17B26A]" : "text-[#D97757]"
                    }`}
                  >
                    {n.nota.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </main>
  );
}
