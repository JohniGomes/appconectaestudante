"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupResponsavelPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const supabase = createClient();

    // 1. Encontra o aluno pela matrícula
    const { data: aluno, error: alunoError } = await supabase
      .from("alunos")
      .select("id, nome")
      .eq("matricula", matricula.trim())
      .maybeSingle();

    if (alunoError || !aluno) {
      setErro("Não encontramos nenhum aluno com essa matrícula. Confira o número e tente de novo.");
      setCarregando(false);
      return;
    }

    // 2. Cria a conta do responsável
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (signUpError) {
      setErro(signUpError.message);
      setCarregando(false);
      return;
    }

    const responsavelId = signUpData.user?.id;
    if (!responsavelId) {
      setErro("Não foi possível criar a conta. Tente novamente.");
      setCarregando(false);
      return;
    }

    // 3. Cria o perfil de responsável
    const { error: perfilError } = await supabase
      .from("responsaveis")
      .insert({ id: responsavelId, nome });

    if (perfilError) {
      setErro(perfilError.message);
      setCarregando(false);
      return;
    }

    // 4. Vincula ao aluno encontrado
    const { error: vinculoError } = await supabase
      .from("aluno_responsavel")
      .insert({ aluno_id: aluno.id, responsavel_id: responsavelId });

    if (vinculoError) {
      setErro(vinculoError.message);
      setCarregando(false);
      return;
    }

    if (signUpData.session) {
      router.replace("/pai");
    } else {
      setErro("Conta criada! Verifique seu e-mail para confirmar o acesso e depois faça login.");
    }
    setCarregando(false);
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl border border-[#E1E7F2] p-6 flex flex-col gap-4 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-extrabold text-[#14213D]">Criar conta de responsável</h1>
          <p className="text-xs text-[#8C9AB8] mt-1">
            Vincule sua conta ao seu filho ou filha usando a matrícula dele(a).
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[#14213D]">Seu nome completo</span>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="input"
            placeholder="Marina Silva"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[#14213D]">Matrícula do seu filho(a)</span>
          <input
            required
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            className="input"
            placeholder="7789"
          />
        </label>

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
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="input"
            placeholder="Mínimo 6 caracteres"
          />
        </label>

        {erro && <p className="text-xs text-[#D9534F]">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-xl bg-[#1B6FC9] text-white font-bold text-sm py-3 disabled:opacity-60"
        >
          {carregando ? "Criando conta..." : "Criar conta e vincular"}
        </button>

        <p className="text-xs text-center text-[#8C9AB8]">
          Já tem conta?{" "}
          <Link href="/login" className="text-[#1B6FC9] font-semibold">
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}
