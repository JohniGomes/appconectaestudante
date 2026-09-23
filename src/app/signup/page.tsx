"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [turma, setTurma] = useState("");
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

    const { data, error } = await supabase.auth.signUp({ email, password: senha });

    if (error) {
      setErro(error.message);
      setCarregando(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const { error: perfilError } = await supabase
        .from("alunos")
        .insert({ id: userId, nome, turma, matricula });

      if (perfilError) {
        setErro(perfilError.message);
        setCarregando(false);
        return;
      }
    }

    if (data.session) {
      router.replace("/dashboard");
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
          <h1 className="text-xl font-extrabold text-[#14213D]">Criar conta de aluno</h1>
          <p className="text-xs text-[#8C9AB8] mt-1">
            Cadastro simplificado para o protótipo demonstrativo.
          </p>
        </div>

        <Field label="Nome completo">
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="input"
            placeholder="Lucas Silva"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Turma">
            <input
              required
              value={turma}
              onChange={(e) => setTurma(e.target.value)}
              className="input"
              placeholder="6º Ano B"
            />
          </Field>
          <Field label="Matrícula">
            <input
              required
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              className="input"
              placeholder="7789"
            />
          </Field>
        </div>

        <Field label="E-mail">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="voce@email.com"
          />
        </Field>

        <Field label="Senha">
          <input
            required
            type="password"
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="input"
            placeholder="Mínimo 6 caracteres"
          />
        </Field>

        {erro && <p className="text-xs text-[#D9534F]">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-xl bg-[#1B6FC9] text-white font-bold text-sm py-3 disabled:opacity-60"
        >
          {carregando ? "Criando conta..." : "Criar conta"}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-[#14213D]">{label}</span>
      {children}
    </label>
  );
}
