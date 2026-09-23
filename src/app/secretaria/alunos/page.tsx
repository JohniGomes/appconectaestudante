"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRequireAuth } from "@/lib/use-require-auth";
import SecretariaShell from "@/components/SecretariaShell";

type Aluno = {
  id: string;
  nome: string;
  turma: string;
  matricula: string;
  consentimento_facial: boolean;
};

export default function SecretariaAlunosPage() {
  const { user, loading } = useRequireAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("alunos")
      .select("id, nome, turma, matricula, consentimento_facial")
      .order("nome")
      .then(({ data }) => {
        setAlunos(data ?? []);
        setCarregando(false);
      });
  }, [user]);

  if (loading || !user) {
    return <main className="flex-1 flex items-center justify-center text-sm text-[#8C9AB8]">Carregando...</main>;
  }

  const filtrados = alunos.filter(
    (a) =>
      a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.matricula.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <SecretariaShell title="Alunos matriculados" subtitle={`${alunos.length} alunos`}>
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome ou matrícula"
        className="input w-full max-w-sm mb-4"
      />

      <div className="bg-white rounded-2xl border border-[#E1E7F2] overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] text-[#8C9AB8] uppercase tracking-wide">
              <th className="px-4 py-3">Aluno</th>
              <th className="px-4 py-3">Turma</th>
              <th className="px-4 py-3">Matrícula</th>
              <th className="px-4 py-3">Biometria</th>
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
            {!carregando && filtrados.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-[#8C9AB8]" colSpan={4}>
                  Nenhum aluno encontrado.
                </td>
              </tr>
            )}
            {filtrados.map((a) => (
              <tr key={a.id} className="border-t border-[#EEF1F7]">
                <td className="px-4 py-3 font-semibold text-[#14213D]">{a.nome}</td>
                <td className="px-4 py-3 text-[#6B7A99]">{a.turma}</td>
                <td className="px-4 py-3 text-[#6B7A99]">{a.matricula}</td>
                <td className="px-4 py-3">
                  <span
                    className={`font-bold ${
                      a.consentimento_facial ? "text-[#17B26A]" : "text-[#D97757]"
                    }`}
                  >
                    {a.consentimento_facial ? "Autorizada" : "Pendente"}
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
