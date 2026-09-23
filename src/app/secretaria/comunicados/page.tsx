"use client";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRequireAuth } from "@/lib/use-require-auth";
import SecretariaShell from "@/components/SecretariaShell";

export default function SecretariaComunicadosPage() {
  const { user, loading } = useRequireAuth();
  const [titulo, setTitulo] = useState("");
  const [mensagemTexto, setMensagemTexto] = useState("");
  const [turma, setTurma] = useState("Todas");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMensagem(null);
    setEnviando(true);

    const supabase = createClient();
    const { error } = await supabase.from("comunicados").insert({
      titulo,
      mensagem: mensagemTexto,
      turma,
      autor: "Secretaria",
    });

    if (error) {
      setMensagem(`Erro: ${error.message}`);
    } else {
      setMensagem("Comunicado publicado — já aparece no app dos alunos.");
      setTitulo("");
      setMensagemTexto("");
    }
    setEnviando(false);
  }

  if (loading || !user) {
    return <main className="flex-1 flex items-center justify-center text-sm text-[#8C9AB8]">Carregando...</main>;
  }

  return (
    <SecretariaShell title="Novo comunicado" subtitle="Publica um aviso para os alunos">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E1E7F2] p-5 max-w-md flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[#14213D]">Enviar para</span>
          <select value={turma} onChange={(e) => setTurma(e.target.value)} className="input">
            <option value="Todas">Todas as turmas</option>
            <option value="6º Ano B">6º Ano B</option>
            <option value="7º Ano A">7º Ano A</option>
            <option value="8º Ano C">8º Ano C</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[#14213D]">Título</span>
          <input
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Reunião de pais"
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[#14213D]">Mensagem</span>
          <textarea
            required
            value={mensagemTexto}
            onChange={(e) => setMensagemTexto(e.target.value)}
            rows={4}
            className="input resize-none"
          />
        </label>

        {mensagem && (
          <p className={`text-xs ${mensagem.startsWith("Erro") ? "text-[#D9534F]" : "text-[#17B26A]"}`}>
            {mensagem}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl bg-[#16A398] text-white font-bold text-sm py-3 disabled:opacity-60"
        >
          {enviando ? "Publicando..." : "Publicar comunicado"}
        </button>
      </form>
    </SecretariaShell>
  );
}
