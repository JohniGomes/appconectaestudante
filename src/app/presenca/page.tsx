"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import AppHeader from "@/components/AppHeader";

type Status = "carregando" | "procurando" | "detectado" | "registrando" | "sucesso" | "erro";

export default function PresencaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectLoopRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const registrandoRef = useRef(false);

  const [status, setStatus] = useState<Status>("carregando");
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    let cancelado = false;

    async function iniciar() {
      try {
        const faceapi = await import("face-api.js");
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 480, height: 640 },
          audio: false,
        });
        if (cancelado) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus("procurando");
        loop(faceapi);
      } catch (err) {
        console.error(err);
        setMensagemErro(
          "Não foi possível acessar a câmera. Verifique a permissão do navegador e tente novamente."
        );
        setStatus("erro");
      }
    }

    function loop(faceapi: typeof import("face-api.js")) {
      const detect = async () => {
        if (cancelado || !videoRef.current || registrandoRef.current) {
          detectLoopRef.current = requestAnimationFrame(detect);
          return;
        }

        const video = videoRef.current;
        if (video.readyState < 2) {
          detectLoopRef.current = requestAnimationFrame(detect);
          return;
        }

        const result = await faceapi.detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        );

        drawBox(video, result?.box ?? null);

        if (result) {
          setStatus("detectado");
          if (holdStartRef.current === null) holdStartRef.current = performance.now();

          const heldFor = performance.now() - holdStartRef.current;
          if (heldFor > 1200 && !registrandoRef.current) {
            registrandoRef.current = true;
            await registrarPresenca(video);
            registrandoRef.current = false;
            return;
          }
        } else {
          holdStartRef.current = null;
          if (status !== "registrando" && status !== "sucesso") setStatus("procurando");
        }

        detectLoopRef.current = requestAnimationFrame(detect);
      };
      detectLoopRef.current = requestAnimationFrame(detect);
    }

    iniciar();

    return () => {
      cancelado = true;
      if (detectLoopRef.current) cancelAnimationFrame(detectLoopRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function drawBox(video: HTMLVideoElement, box: { x: number; y: number; width: number; height: number } | null) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!box) return;
    ctx.strokeStyle = "#5EEAD4";
    ctx.lineWidth = 4;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  }

  async function registrarPresenca(video: HTMLVideoElement) {
    setStatus("registrando");

    const supabase = createClient();
    const captureCanvas = document.createElement("canvas");
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    captureCanvas.getContext("2d")?.drawImage(video, 0, 0);

    let fotoUrl: string | null = null;

    try {
      const blob: Blob | null = await new Promise((resolve) =>
        captureCanvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
      );

      if (blob && user) {
        const path = `${user.id}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("presencas")
          .upload(path, blob, { contentType: "image/jpeg" });

        if (!uploadError) {
          const { data } = supabase.storage.from("presencas").getPublicUrl(path);
          fotoUrl = data.publicUrl;
        }
      }
    } catch (err) {
      console.warn("Falha ao enviar foto (seguindo sem foto):", err);
    }

    const { error } = await supabase
      .from("presencas")
      .insert({ aluno_id: user!.id, foto_url: fotoUrl });

    if (error) {
      setMensagemErro(error.message);
      setStatus("erro");
      return;
    }

    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (detectLoopRef.current) cancelAnimationFrame(detectLoopRef.current);
    setStatus("sucesso");
  }

  if (loading || !user) {
    return <main className="flex-1 flex items-center justify-center text-sm text-[#8C9AB8]">Carregando...</main>;
  }

  return (
    <main className="flex-1 flex flex-col">
      <AppHeader subtitle="Conecta Estudante" title="Bater presença" />

      <div className="flex-1 px-5 py-6 flex flex-col items-center gap-5 max-w-sm w-full mx-auto">
        {status === "sucesso" ? (
          <div className="w-full flex flex-col items-center gap-4 py-10">
            <div className="w-16 h-16 rounded-full bg-[#E4F7F3] flex items-center justify-center">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#17B26A" strokeWidth="3">
                <path d="M5 12l4 4L19 6" />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-lg font-extrabold text-[#14213D]">Presença registrada!</div>
              <div className="text-xs text-[#8C9AB8] mt-1">
                {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} &middot;{" "}
                {new Date().toLocaleDateString("pt-BR")}
              </div>
            </div>
            <Link
              href="/dashboard"
              className="w-full rounded-xl bg-[#14213D] text-white font-bold text-sm py-3 text-center mt-2"
            >
              Voltar ao início
            </Link>
          </div>
        ) : (
          <>
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#0B1226]">
              <video
                ref={videoRef}
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover -scale-x-100"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full -scale-x-100 pointer-events-none"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 rounded-full px-3 py-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    status === "detectado" || status === "registrando" ? "bg-[#17B26A]" : "bg-[#D97757]"
                  }`}
                />
                <span className="text-[10px] font-bold text-white">
                  {status === "carregando" && "Carregando modelo..."}
                  {status === "procurando" && "Procurando rosto..."}
                  {status === "detectado" && "Rosto detectado"}
                  {status === "registrando" && "Registrando..."}
                  {status === "erro" && "Erro"}
                </span>
              </div>
            </div>

            <p className="text-xs text-center text-[#8C9AB8]">
              Posicione o rosto dentro da câmera. A presença é registrada automaticamente após
              cerca de 1 segundo de detecção.
            </p>

            {mensagemErro && <p className="text-xs text-center text-[#D9534F]">{mensagemErro}</p>}

            <Link href="/dashboard" className="text-xs font-semibold text-[#1B6FC9]">
              Cancelar
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
