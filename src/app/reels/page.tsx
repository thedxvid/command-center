"use client";

import { useState, useEffect } from "react";

type Caption = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
};

type Segment = {
  index: number;
  text: string;
  startMs: number;
  endMs: number;
  isCutPoint: boolean;
};

type ProcessResult = {
  captions: Caption[];
  segments: Segment[];
  fullText: string;
  durationSeconds: number;
  fileName: string;
  remotionSrc: string;
};

function msToTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function ReelsPage() {
  const [videos, setVideos] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/video/list")
      .then((r) => r.json())
      .then((d) => setVideos(d.videos ?? []));
  }, []);

  async function handleProcess() {
    if (!selected) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/video/process-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: selected }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Erro ao processar");
      }

      const data: ProcessResult = await res.json();
      setResult(data);
      setSegments(data.segments);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  function toggleCutPoint(index: number) {
    setSegments((prev) =>
      prev.map((s) => (s.index === index ? { ...s, isCutPoint: !s.isCutPoint } : s))
    );
  }

  function copyRemotionProps() {
    if (!result) return;
    const props = {
      videoSrc: result.remotionSrc,
      captions: result.captions,
      highlightColor: "#FFDD00",
      captionColor: "#FFFFFF",
      fontSize: 80,
    };
    navigator.clipboard.writeText(JSON.stringify(props, null, 2));
    alert("Props copiadas! Cole no Remotion Studio na composição CaptionedVideo.");
  }

  const cutPoints = segments.filter((s) => s.isCutPoint);

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Reels com Legendas</h1>
        <p className="text-zinc-400 mb-8">
          Selecione um vídeo da pasta local, o Whisper extrai áudio e gera legendas
          sincronizadas para usar no Remotion.
        </p>

        {/* Lista de vídeos locais */}
        <div className="bg-zinc-900 rounded-xl p-4 mb-6">
          <p className="text-sm text-zinc-400 mb-3">Vídeos disponíveis em <code className="text-yellow-400">videos para editar/</code></p>
          {videos.length === 0 ? (
            <p className="text-zinc-600 text-sm">Nenhum vídeo encontrado</p>
          ) : (
            <div className="space-y-2">
              {videos.map((v) => (
                <button
                  key={v}
                  onClick={() => setSelected(v)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition text-sm font-mono ${
                    selected === v
                      ? "bg-yellow-400 text-black font-bold"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleProcess}
          disabled={!selected || loading}
          className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl disabled:opacity-40 hover:bg-yellow-300 transition mb-8"
        >
          {loading
            ? "Processando com Whisper... (pode levar alguns minutos)"
            : `Extrair Legendas${selected ? ` — ${selected}` : ""}`}
        </button>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {result && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-zinc-900 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-yellow-400">{result.captions.length}</p>
                <p className="text-zinc-400 text-sm">palavras</p>
              </div>
              <div className="bg-zinc-900 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-yellow-400">{cutPoints.length}</p>
                <p className="text-zinc-400 text-sm">pontos de corte</p>
              </div>
              <div className="bg-zinc-900 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {msToTime(result.durationSeconds * 1000)}
                </p>
                <p className="text-zinc-400 text-sm">duração</p>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl p-6 mb-6">
              <h2 className="font-semibold mb-3 text-zinc-300">Transcrição completa</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">{result.fullText}</p>
            </div>

            <div className="bg-zinc-900 rounded-xl p-6 mb-6">
              <h2 className="font-semibold mb-4 text-zinc-300">
                Segmentos — clique para marcar/desmarcar cortes
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {segments.map((seg) => (
                  <div
                    key={seg.index}
                    onClick={() => toggleCutPoint(seg.index)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                      seg.isCutPoint
                        ? "bg-red-900/30 border border-red-500"
                        : "bg-zinc-800 hover:bg-zinc-700"
                    }`}
                  >
                    <span className="text-xs text-zinc-500 w-24 shrink-0">
                      {msToTime(seg.startMs)} → {msToTime(seg.endMs)}
                    </span>
                    <span className="text-sm flex-1">{seg.text}</span>
                    {seg.isCutPoint && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full shrink-0">
                        CORTE
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={copyRemotionProps}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-xl transition"
            >
              Copiar Props para o Remotion Studio
            </button>
            <p className="text-zinc-500 text-xs text-center mt-2">
              Cole na composição <code>CaptionedVideo</code> do Remotion Studio
            </p>
          </>
        )}
      </div>
    </main>
  );
}
