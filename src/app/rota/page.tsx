"use client";

import { useRequireAuth } from "@/lib/use-require-auth";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

export default function RotaPage() {
  const { user, loading } = useRequireAuth();

  if (loading || !user) {
    return <main className="flex-1 flex items-center justify-center text-sm text-[#8C9AB8]">Carregando...</main>;
  }

  return (
    <main className="flex-1 flex flex-col">
      <AppHeader subtitle="Conecta Estudante" title="Ônibus 12 · Rota Leste" />

      <div className="flex-1 px-5 py-6 flex flex-col gap-5 max-w-sm w-full mx-auto">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#DCE6F5] to-[#C6D9F0] relative h-48 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B6FC9" strokeWidth="3">
            <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <span className="absolute top-3 right-3 bg-[#17B26A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white" /> AO VIVO (demo)
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E1E7F2] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[#14213D]">Motorista: João Pereira</div>
              <div className="text-xs text-[#8C9AB8]">Placa ABC-1D23</div>
            </div>
          </div>
          <div className="h-px bg-[#EEF1F7]" />
          <div className="flex gap-6">
            <div>
              <div className="text-[10px] font-bold text-[#8C9AB8]">CHEGADA PREVISTA</div>
              <div className="text-sm font-bold text-[#14213D]">2 min · Escola</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#8C9AB8]">ALUNOS A BORDO</div>
              <div className="text-sm font-bold text-[#14213D]">28 de 30</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-[#8C9AB8] text-center px-4">
          Posição simulada para demonstração. Na versão final, o rastreamento vem de um GPS
          instalado no veículo.
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
