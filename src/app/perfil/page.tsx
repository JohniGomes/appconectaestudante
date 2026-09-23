"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRequireAuth } from "@/lib/use-require-auth";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

type Perfil = {
  nome: string;
  turma: string;
  matricula: string;
  consentimento_facial: boolean;
  consentimento_geo: boolean;
  consentimento_cftv: boolean;
};

export default function PerfilPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("alunos")
      .select("nome, turma, matricula, consentimento_facial, consentimento_geo, consentimento_cftv")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setPerfil(data));
  }, [user]);

  async function toggle(campo: keyof Perfil) {
    if (!perfil || !user) return;
    const novoValor = !perfil[campo];
    setPerfil({ ...perfil, [campo]: novoValor });
    setSalvando(true);
    const supabase = createClient();
    await supabase.from("alunos").update({ [campo]: novoValor }).eq("id", user.id);
    setSalvando(false);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading || !user || !perfil) {
    return <main className="flex-1 flex items-center justify-center text-sm text-[#8C9AB8]">Carregando...</main>;
  }

  return (
    <main className="flex-1 flex flex-col">
      <div className="bg-[#14213D] px-5 py-7 flex flex-col items-center gap-2 rounded-b-3xl">
        <div className="w-16 h-16 rounded-2xl bg-[#1B6FC9] flex items-center justify-center text-xl font-extrabold text-white">
          {perfil.nome
            .split(" ")
            .slice(0, 2)
            .map((p) => p[0])
            .join("")}
        </div>
        <div className="text-white text-base font-extrabold">{perfil.nome}</div>
        <div className="text-[#9FB3D9] text-xs">
          {perfil.turma} · matrícula {perfil.matricula}
        </div>
      </div>

      <div className="flex-1 px-5 py-6 flex flex-col gap-5 max-w-sm w-full mx-auto">
        <div>
          <div className="text-xs font-bold text-[#8C9AB8] uppercase tracking-wide mb-2">
            Privacidade e consentimentos
          </div>
          <div className="bg-white rounded-2xl border border-[#E1E7F2] divide-y divide-[#EEF1F7]">
            <ToggleRow
              label="Reconhecimento facial"
              checked={perfil.consentimento_facial}
              onChange={() => toggle("consentimento_facial")}
            />
            <ToggleRow
              label="Geolocalização do transporte"
              checked={perfil.consentimento_geo}
              onChange={() => toggle("consentimento_geo")}
            />
            <ToggleRow
              label="Câmeras da sala (CFTV)"
              checked={perfil.consentimento_cftv}
              onChange={() => toggle("consentimento_cftv")}
            />
          </div>
          {salvando && <div className="text-[10px] text-[#8C9AB8] mt-1">Salvando...</div>}
        </div>

        <button
          onClick={handleLogout}
          className="w-full rounded-xl bg-white border border-[#F3D4D2] text-[#D9534F] font-bold text-sm py-3"
        >
          Sair da conta
        </button>
      </div>
      <BottomNav />
    </main>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="w-full px-4 py-3.5 flex items-center justify-between text-left"
    >
      <span className="text-sm font-semibold text-[#14213D]">{label}</span>
      <span
        className={`w-10 h-6 rounded-full relative transition-colors ${
          checked ? "bg-[#17B26A]" : "bg-[#DCE1EC]"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
