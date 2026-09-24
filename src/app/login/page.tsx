"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setErro(error.message);
      setCarregando(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const { data: responsavel } = await supabase
        .from("responsaveis")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (responsavel) {
        router.replace("/pai");
        return;
      }
    }

    router.replace("/dashboard");
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl border border-[#E1E7F2] p-6 flex flex-col gap-4 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-extrabold text-[#14213D]">Entrar</h1>
          <p className="text-xs text-[#8C9AB8] mt-1">Acesse com o e-mail e senha do cadastro.</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[#14213D]">E-mail</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="voce@email.com"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[#14213D]">Senha</span>
          <input
            required
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="input"
            placeholder="••••••••"
          />
        </label>

        {erro && <p className="text-xs text-[#D9534F]">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-xl bg-[#14213D] text-white font-bold text-sm py-3 disabled:opacity-60"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-xs text-center text-[#8C9AB8]">
          Ainda não tem conta?{" "}
          <Link href="/signup" className="text-[#1B6FC9] font-semibold">
            Criar conta de aluno
          </Link>
        </p>
        <p className="text-xs text-center text-[#8C9AB8]">
          É responsável por um aluno?{" "}
          <Link href="/signup-responsavel" className="text-[#1B6FC9] font-semibold">
            Criar conta de responsável
          </Link>
        </p>
      </form>
    </main>
  );
}
