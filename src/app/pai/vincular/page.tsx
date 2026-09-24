"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRequireAuth } from "@/lib/use-require-auth";

export default function VincularFilhoPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const [matricula, setMatricula] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const supabase = createClient();

    const { data: aluno, error: alunoError } = await supabase
      .from("alunos")
      .select("id")
      .eq("matricula", matricula.trim())
      .maybeSingle();

    if (alunoError || !aluno) {
      setErro("Não encontramos nenhum aluno com essa matrícula.");
      setCarregando(false);
      return;
    }

    const { error: vinculoError } = await supabase
      .from("aluno_responsavel")
      .insert({ aluno_id: aluno.id, responsavel_id: user!.id });

    if (vinculoError) {
      setErro(
        vinculoError.code === "23505"
          ? "Esse aluno já está vinculado à sua conta."
          : vinculoError.message
      );
      setCarregando(false);
      return;
    }

    router.replace("/pai");
  }

  if (loading || !user) {
    return <main className="flex-1 flex items-center justify-center text-sm text-[#8C9AB8]">Carregando...</main>;
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl border border-[#E1E7F2] p-6 flex flex-col gap-4 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-extrabold text-[#14213D]">Vincular filho(a)</h1>
          <p className="text-xs text-[#8C9AB8] mt-1">Informe a matrícula do aluno.</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[#14213D]">Matrícula</span>
          <input
            required
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            className="input"
            placeholder="7789"
          />
        </label>

        {erro && <p className="text-xs text-[#D9534F]">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-xl bg-[#1B6FC9] text-white font-bold text-sm py-3 disabled:opacity-60"
        >
          {carregando ? "Vinculando..." : "Vincular"}
        </button>

        <Link href="/pai" className="text-xs font-semibold text-[#8C9AB8] text-center">
          Cancelar
        </Link>
      </form>
    </main>
  );
}
