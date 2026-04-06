import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { createReadStream, existsSync } from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TMP_DIR = path.join(process.cwd(), "tmp");

async function ensureTmpDir() {
  if (!existsSync(TMP_DIR)) await mkdir(TMP_DIR, { recursive: true });
}

async function extractAudio(videoPath: string, audioPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec("pcm_s16le")
      .audioFrequency(16000)
      .audioChannels(1)
      .output(audioPath)
      .on("end", () => resolve())
      .on("error", (err: Error) => reject(err))
      .run();
  });
}

async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, meta) => {
      if (err) reject(err);
      else resolve(meta.format.duration ?? 0);
    });
  });
}

export async function POST(req: NextRequest) {
  await ensureTmpDir();

  const formData = await req.formData();
  const file = formData.get("video") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Nenhum vídeo enviado" }, { status: 400 });
  }

  const videoPath = path.join(TMP_DIR, `video_${Date.now()}_${file.name}`);
  const audioPath = videoPath.replace(/\.[^.]+$/, ".wav");

  try {
    // Salva o vídeo no disco temporariamente
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(videoPath, buffer);

    // Extrai o áudio
    await extractAudio(videoPath, audioPath);

    // Duração total do vídeo
    const durationSeconds = await getVideoDuration(videoPath);

    // Transcreve com Whisper (word-level timestamps)
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(audioPath) as unknown as File,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word", "segment"],
    });

    // Monta captions no formato do @remotion/captions
    const captions = (transcription.words ?? []).map((w) => ({
      text: w.word,
      startMs: Math.round(w.start * 1000),
      endMs: Math.round(w.end * 1000),
      timestampMs: Math.round(w.start * 1000) as number | null,
      confidence: 1 as number | null,
    }));

    // Segmentos como pontos de corte sugeridos (pausas entre falas)
    const segments = (transcription.segments ?? []).map((s, i) => ({
      index: i,
      text: s.text.trim(),
      startMs: Math.round(s.start * 1000),
      endMs: Math.round(s.end * 1000),
      // Se a pausa antes deste segmento for > 1s, marca como ponto de corte
      isCutPoint:
        i > 0
          ? s.start - (transcription.segments![i - 1]?.end ?? s.start) > 1.0
          : false,
    }));

    return NextResponse.json({
      captions,
      segments,
      fullText: transcription.text,
      durationSeconds,
      fileName: file.name,
    });
  } finally {
    // Limpa os temporários
    for (const p of [videoPath, audioPath]) {
      if (existsSync(p)) await unlink(p).catch(() => {});
    }
  }
}

export const config = {
  api: { bodyParser: false },
};
