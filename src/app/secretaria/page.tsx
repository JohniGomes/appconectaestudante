"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRequireAuth } from "@/lib/use-require-auth";
import SecretariaShell from "@/components/SecretariaShell";

type Aluno = { id: string; nome: string; turma: string };
type Presenca = { aluno_id: string; registrado_em: string };

export default function SecretariaDashboard() {
  const { user, loading } = useRequireAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [presencasHoje, setPresencasHoje] = useState<Presenca[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    Promise.all([
      supabase.from("alunos").select("id, nome, turma"),
      supabase
        .from("presencas")
        .select("aluno_id, registrado_em")
        .gte("registrado_em", inicioDoDia.toISOString()),
    ]).then(([alunosRes, presencasRes]) => {
      setAlunos(alunosRes.data ?? []);
      setPresencasHoje(presencasRes.data ?? []);
      setCarregando(false);
    });
  }, [user]);

  if (loading || !user) {
    return <main className="flex-1 flex items-center justify-center text-sm text-[#8C9AB8]">Carregando...</main>;
  }

  const idsComPresenca = new Set(presencasHoje.map((p) => p.aluno_id));
  const presentesHoje = alunos.filter((a) => idsComPresenca.has(a.id));
  const percentual = alunos.length > 0 ? Math.round((presentesHoje.length / alunos.length) * 100) : 0;

  return (
    <SecretariaShell title="Presença auditável" subtitle="Todos os alunos cadastrados">
      {carregando ? (
        <div className="text-xs text-[#8C9AB8]">Carregando...</div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Kpi label="Alunos cadastrados" value={String(alunos.length)} />
            <Kpi label="Presentes hoje" value={String(presentesHoje.length)} color="#17B26A" />
            <Kpi label="Sem check-in hoje" value={String(alunos.length - presentesHoje.length)} color="#D9534F" />
            <Kpi label="Presença do dia" value={`${percentual}%`} color="#1B6FC9" />
          </div>

          <div className="bg-white rounded-2xl border border-[#E1E7F2] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#EEF1F7] text-sm font-bold text-[#14213D]">
              Check-ins de hoje
            </div>
            <div className="divide-y divide-[#EEF1F7]">
              {alunos.length === 0 && (
                <div className="px-4 py-4 text-xs text-[#8C9AB8]">Nenhum aluno cadastrado ainda.</div>
              )}
              {alunos.map((a) => {
                const registro = presencasHoje.find((p) => p.aluno_id === a.id);
                return (
                  <div key={a.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#14213D]">{a.nome}</div>
                      <div className="text-[10px] text-[#8C9AB8]">{a.turma}</div>
                    </div>
                    {registro ? (
                      <span className="text-xs font-bold text-[#17B26A]">
                        {new Date(registro.registrado_em).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-[#D9534F]">Sem check-in</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </SecretariaShell>
  );
}

function Kpi({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E1E7F2] p-4">
      <div className="text-[10px] font-bold text-[#8C9AB8] uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-extrabold mt-1" style={{ color: color ?? "#14213D" }}>
        {value}
      </div>
    </div>
  );
}
