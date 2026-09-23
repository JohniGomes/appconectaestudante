"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm text-center flex flex-col items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-[#1B6FC9] flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#14213D]">Conecta Estudante</h1>
          <p className="text-sm text-[#6B7A99] mt-2">
            Protótipo funcional &mdash; presença via reconhecimento facial pela câmera do
            celular.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full mt-2">
          <Link
            href="/login"
            className="w-full rounded-xl bg-[#14213D] text-white font-bold text-sm py-3 text-center"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="w-full rounded-xl bg-white border border-[#E1E7F2] text-[#14213D] font-bold text-sm py-3 text-center"
          >
            Criar conta de aluno
          </Link>
        </div>
      </div>
    </main>
  );
}
