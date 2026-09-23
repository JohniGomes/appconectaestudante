"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import AppHeader from "@/components/AppHeader";

type Aluno = {
  nome: string;
  turma: string;
  matricula: string;
};

type Presenca = {
  id: string;
  registrado_em: string;
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    async function carregar() {
      const [{ data: alunoData }, { data: presencasData }] = await Promise.all([
        supabase.from("alunos").select("nome, turma, matricula").eq("id", user!.id).single(),
        supabase
          .from("presencas")
          .select("id, registrado_em")
          .eq("aluno_id", user!.id)
          .order("registrado_em", { ascending: false })
          .limit(10),
      ]);

      setAluno(alunoData);
      setPresencas(presencasData ?? []);
      setCarregandoDados(false);
    }

    carregar();
  }, [user]);

  if (loading || !user) {
    return <main className="flex-1 flex items-center justify-center text-sm text-[#8C9AB8]">Carregando...</main>;
  }

  const hoje = new Date().toDateString();
  const presencaHoje = presencas.find((p) => new Date(p.registrado_em).toDateString() === hoje);

  return (
    <main className="flex-1 flex flex-col">
      <AppHeader
        subtitle={aluno ? `${aluno.turma} · matrícula ${aluno.matricula}` : undefined}
        title={aluno ? `Olá, ${aluno.nome.split(" ")[0]}` : "Olá"}
      />

      <div className="flex-1 px-5 py-6 flex flex-col gap-5 max-w-sm w-full mx-auto">
        <div className="bg-white rounded-2xl border border-[#E1E7F2] p-4 flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              presencaHoje ? "bg-[#E4F7F3]" : "bg-[#FDF0E3]"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={presencaHoje ? "#16A398" : "#D97757"}
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-[#14213D]">
              {presencaHoje ? "Presença registrada hoje" : "Ainda sem presença hoje"}
            </div>
            <div className="text-xs text-[#8C9AB8]">
              {presencaHoje
                ? new Date(presencaHoje.registrado_em).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Bata presença pela câmera"}
            </div>
          </div>
        </div>

        <Link
          href="/presenca"
          className="w-full rounded-xl bg-[#1B6FC9] text-white font-bold text-sm py-3.5 text-center flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <rect x="3" y="6" width="14" height="12" rx="2" />
            <path d="M17 10l4-2.5v9L17 14" />
          </svg>
          Bater presença
        </Link>

        <div>
          <div className="text-sm font-bold text-[#14213D] mb-2">Histórico recente</div>
          <div className="bg-white rounded-2xl border border-[#E1E7F2] divide-y divide-[#EEF1F7]">
            {carregandoDados && (
              <div className="px-4 py-4 text-xs text-[#8C9AB8]">Carregando...</div>
            )}
            {!carregandoDados && presencas.length === 0 && (
              <div className="px-4 py-4 text-xs text-[#8C9AB8]">Nenhuma presença registrada ainda.</div>
            )}
            {presencas.map((p) => (
              <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-[#14213D]">
                  {new Date(p.registrado_em).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
                <span className="text-xs font-semibold text-[#17B26A]">
                  {new Date(p.registrado_em).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
