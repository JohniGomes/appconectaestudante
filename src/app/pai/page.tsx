"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRequireAuth } from "@/lib/use-require-auth";

type Aluno = { id: string; nome: string; turma: string; matricula: string };
type Presenca = { id: string; aluno_id: string; registrado_em: string };

export default function PaiPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();

  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [filhos, setFilhos] = useState<Aluno[]>([]);
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [notifOn, setNotifOn] = useState(false);
  const filhosRef = useRef<Aluno[]>([]);

  useEffect(() => {
    filhosRef.current = filhos;
  }, [filhos]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    async function carregar() {
      const { data: perfil } = await supabase
        .from("responsaveis")
        .select("nome")
        .eq("id", user!.id)
        .maybeSingle();
      setNomeResponsavel(perfil?.nome ?? "");

      const { data: vinculos } = await supabase
        .from("aluno_responsavel")
        .select("aluno_id")
        .eq("responsavel_id", user!.id);

      const alunoIds = (vinculos ?? []).map((v) => v.aluno_id);
      if (alunoIds.length === 0) {
        setCarregando(false);
        return;
      }

      const [{ data: alunosData }, { data: presencasData }] = await Promise.all([
        supabase.from("alunos").select("id, nome, turma, matricula").in("id", alunoIds),
        supabase
          .from("presencas")
          .select("id, aluno_id, registrado_em")
          .in("aluno_id", alunoIds)
          .order("registrado_em", { ascending: false })
          .limit(15),
      ]);

      setFilhos(alunosData ?? []);
      setPresencas(presencasData ?? []);
      setCarregando(false);
    }

    carregar();
  }, [user]);

  // Assinatura em tempo real: novo check-in de qualquer filho vinculado
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const channel = supabase
      .channel("presencas-pai")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "presencas" },
        (payload) => {
          const nova = payload.new as Presenca;
          const filho = filhosRef.current.find((f) => f.id === nova.aluno_id);
          if (!filho) return;

          setPresencas((prev) => [nova, ...prev]);

          const hora = new Date(nova.registrado_em).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const texto = `${filho.nome} fez check-in na escola às ${hora}`;
          setToast(texto);
          setTimeout(() => setToast(null), 6000);

          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            new Notification("Conecta Estudante", { body: texto });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function ativarNotificacoes() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const permissao = await Notification.requestPermission();
    setNotifOn(permissao === "granted");
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading || !user) {
    return <main className="flex-1 flex items-center justify-center text-sm text-[#8C9AB8]">Carregando...</main>;
  }

  return (
    <main className="flex-1 flex flex-col">
      <div className="bg-[#14213D] px-5 py-5 flex items-center justify-between rounded-b-3xl">
        <div>
          <div className="text-[#9FB3D9] text-[11px] font-bold">CONECTA ESTUDANTE · RESPONSÁVEL</div>
          <div className="text-white text-lg font-extrabold">
            {nomeResponsavel ? `Olá, ${nomeResponsavel.split(" ")[0]}` : "Olá"}
          </div>
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
      </div>

      {toast && (
        <div className="mx-5 mt-4 bg-[#E4F7F3] border border-[#B9EFE0] text-[#0E6B54] text-xs font-semibold rounded-xl px-4 py-3 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#17B26A" strokeWidth="2" className="flex-shrink-0">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          {toast}
        </div>
      )}

      <div className="flex-1 px-5 py-6 flex flex-col gap-5 max-w-sm w-full mx-auto">
        {!notifOn && (
          <button
            onClick={ativarNotificacoes}
            className="text-xs font-bold text-[#1B6FC9] bg-[#EAF1FC] rounded-xl px-4 py-3 flex items-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1B6FC9" strokeWidth="2">
              <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 01-3.4 0" />
            </svg>
            Ativar notificações do navegador
          </button>
        )}

        {carregando && <div className="text-xs text-[#8C9AB8]">Carregando...</div>}

        {!carregando && filhos.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E1E7F2] p-5 text-center">
            <div className="text-sm font-bold text-[#14213D]">Nenhum filho vinculado ainda</div>
            <div className="text-xs text-[#8C9AB8] mt-1">Vincule usando a matrícula do aluno.</div>
            <Link
              href="/pai/vincular"
              className="inline-block mt-3 text-xs font-bold text-white bg-[#1B6FC9] px-4 py-2 rounded-lg"
            >
              Vincular filho(a)
            </Link>
          </div>
        )}

        {filhos.map((filho) => {
          const ultimaPresenca = presencas.find((p) => p.aluno_id === filho.id);
          const hoje = new Date().toDateString();
          const presenteHoje =
            ultimaPresenca && new Date(ultimaPresenca.registrado_em).toDateString() === hoje;

          return (
            <div key={filho.id} className="bg-white rounded-2xl border border-[#E1E7F2] p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#EAF1FC] flex items-center justify-center font-extrabold text-[#1B6FC9] text-sm flex-shrink-0">
                {filho.nome
                  .split(" ")
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-[#14213D]">{filho.nome}</div>
                <div className="text-xs text-[#8C9AB8]">{filho.turma}</div>
              </div>
              <div className="text-right">
                {presenteHoje ? (
                  <>
                    <div className="text-xs font-bold text-[#17B26A]">Check-in feito</div>
                    <div className="text-[10px] text-[#8C9AB8]">
                      {new Date(ultimaPresenca!.registrado_em).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-xs font-bold text-[#D97757]">Sem check-in hoje</div>
                )}
              </div>
            </div>
          );
        })}

        {filhos.length > 0 && (
          <>
            <div>
              <div className="text-sm font-bold text-[#14213D] mb-2">Últimos check-ins</div>
              <div className="bg-white rounded-2xl border border-[#E1E7F2] divide-y divide-[#EEF1F7]">
                {presencas.length === 0 && (
                  <div className="px-4 py-4 text-xs text-[#8C9AB8]">Nenhum check-in registrado ainda.</div>
                )}
                {presencas.map((p) => {
                  const filho = filhos.find((f) => f.id === p.aluno_id);
                  return (
                    <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-[#14213D]">{filho?.nome}</div>
                        <div className="text-[10px] text-[#8C9AB8]">
                          {new Date(p.registrado_em).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#17B26A]">
                        {new Date(p.registrado_em).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Link href="/pai/vincular" className="text-xs font-semibold text-[#1B6FC9] text-center">
              + Vincular outro filho(a)
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
