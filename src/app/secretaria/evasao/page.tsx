"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRequireAuth } from "@/lib/use-require-auth";
import SecretariaShell from "@/components/SecretariaShell";

type Aluno = { id: string; nome: string; turma: string };
type Presenca = { aluno_id: string; registrado_em: string };

const DIAS_JANELA = 7;

export default function SecretariaEvasaoPage() {
  const { user, loading } = useRequireAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [ultimaPresenca, setUltimaPresenca] = useState<Map<string, string>>(new Map());
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const desde = new Date();
    desde.setDate(desde.getDate() - 30);

    Promise.all([
      supabase.from("alunos").select("id, nome, turma"),
      supabase
        .from("presencas")
        .select("aluno_id, registrado_em")
        .gte("registrado_em", desde.toISOString())
        .order("registrado_em", { ascending: false }),
    ]).then(([alunosRes, presencasRes]) => {
      setAlunos(alunosRes.data ?? []);
      const mapa = new Map<string, string>();
      (presencasRes.data as Presenca[] | null)?.forEach((p) => {
        if (!mapa.has(p.aluno_id)) mapa.set(p.aluno_id, p.registrado_em);
      });
      setUltimaPresenca(mapa);
      setCarregando(false);
    });
  }, [user]);

  if (loading || !user) {
    return <main className="flex-1 flex items-center justify-center text-sm text-[#8C9AB8]">Carregando...</main>;
  }

  const hoje = new Date();
  const emRisco = alunos
    .map((a) => {
      const ultima = ultimaPresenca.get(a.id);
      const dias = ultima
        ? Math.floor((hoje.getTime() - new Date(ultima).getTime()) / 86400000)
        : null;
      return { ...a, ultima, dias };
    })
    .filter((a) => a.dias === null || a.dias >= DIAS_JANELA)
    .sort((a, b) => (b.dias ?? 999) - (a.dias ?? 999));

  return (
    <SecretariaShell
      title="Alunos em risco de evasão"
      subtitle={`Sem presença há ${DIAS_JANELA}+ dias (ou nunca registrada)`}
    >
      <div className="bg-white rounded-2xl border border-[#E1E7F2] overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] text-[#8C9AB8] uppercase tracking-wide">
              <th className="px-4 py-3">Aluno</th>
              <th className="px-4 py-3">Turma</th>
              <th className="px-4 py-3">Última presença</th>
              <th className="px-4 py-3">Nível de risco</th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td className="px-4 py-4 text-[#8C9AB8]" colSpan={4}>
                  Carregando...
                </td>
              </tr>
            )}
            {!carregando && emRisco.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-[#8C9AB8]" colSpan={4}>
                  Nenhum aluno em risco no momento — todos com presença recente.
                </td>
              </tr>
            )}
            {emRisco.map((a) => (
              <tr key={a.id} className="border-t border-[#EEF1F7]">
                <td className="px-4 py-3 font-semibold text-[#14213D]">{a.nome}</td>
                <td className="px-4 py-3 text-[#6B7A99]">{a.turma}</td>
                <td className="px-4 py-3 text-[#6B7A99]">
                  {a.ultima
                    ? new Date(a.ultima).toLocaleDateString("pt-BR")
                    : "Nunca registrada"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-bold ${
                      a.dias === null || a.dias >= 14 ? "text-[#D9534F]" : "text-[#D97757]"
                    }`}
                  >
                    {a.dias === null || a.dias >= 14 ? "Alto" : "Médio"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SecretariaShell>
  );
}
