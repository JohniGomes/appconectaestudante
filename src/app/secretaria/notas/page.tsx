"use client";

import { useEffect, useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRequireAuth } from "@/lib/use-require-auth";
import SecretariaShell from "@/components/SecretariaShell";

type Aluno = { id: string; nome: string; turma: string };

export default function SecretariaNotasPage() {
  const { user, loading } = useRequireAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoId, setAlunoId] = useState("");
  const [disciplina, setDisciplina] = useState("Matemática");
  const [avaliacao, setAvaliacao] = useState("");
  const [nota, setNota] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("alunos")
      .select("id, nome, turma")
      .order("nome")
      .then(({ data }) => setAlunos(data ?? []));
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMensagem(null);
    setEnviando(true);

    const supabase = createClient();
    const { error } = await supabase.from("notas").insert({
      aluno_id: alunoId,
      disciplina,
      avaliacao,
      nota: Number(nota.replace(",", ".")),
    });

    if (error) {
      setMensagem(`Erro: ${error.message}`);
    } else {
      setMensagem("Nota lançada com sucesso.");
      setAvaliacao("");
      setNota("");
    }
    setEnviando(false);
  }

  if (loading || !user) {
    return <main className="flex-1 flex items-center justify-center text-sm text-[#8C9AB8]">Carregando...</main>;
  }

  return (
    <SecretariaShell title="Lançar notas" subtitle="Registra uma nota para um aluno">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E1E7F2] p-5 max-w-md flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[#14213D]">Aluno</span>
          <select
            required
            value={alunoId}
            onChange={(e) => setAlunoId(e.target.value)}
            className="input"
          >
            <option value="">Selecione um aluno</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome} — {a.turma}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[#14213D]">Disciplina</span>
          <input
            required
            value={disciplina}
            onChange={(e) => setDisciplina(e.target.value)}
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[#14213D]">Avaliação</span>
          <input
            required
            value={avaliacao}
            onChange={(e) => setAvaliacao(e.target.value)}
            placeholder="Ex: Prova bimestral"
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[#14213D]">Nota (0 a 10)</span>
          <input
            required
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="8,5"
            className="input"
          />
        </label>

        {mensagem && (
          <p className={`text-xs ${mensagem.startsWith("Erro") ? "text-[#D9534F]" : "text-[#17B26A]"}`}>
            {mensagem}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando || !alunoId}
          className="rounded-xl bg-[#16A398] text-white font-bold text-sm py-3 disabled:opacity-60"
        >
          {enviando ? "Salvando..." : "Lançar nota"}
        </button>
      </form>
    </SecretariaShell>
  );
}
