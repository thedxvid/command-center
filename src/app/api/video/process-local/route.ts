import { NextRequest, NextResponse } from "next/server";
import { mkdir, unlink } from "fs/promises";
import { createReadStream, existsSync } from "fs";
import path from "path";

async function getTmpDir() {
  const dir = path.join(process.cwd(), "tmp");
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  return dir;
}

async function extractAudio(videoPath: string, audioPath: string): Promise<void> {
  const ffmpeg = (await import("fluent-ffmpeg")).default;
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
  const ffmpeg = (await import("fluent-ffmpeg")).default;
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, meta) => {
      if (err) reject(err);
      else resolve(meta.format.duration ?? 0);
    });
  });
}

export async function POST(req: NextRequest) {
  const tmpDir = await getTmpDir();
  const videosDir = path.join(process.cwd(), "videos para editar");

  const { fileName } = (await req.json()) as { fileName: string };

  if (!fileName) {
    return NextResponse.json({ error: "fileName é obrigatório" }, { status: 400 });
  }

  const safeFileName = path.basename(fileName);
  const videoPath = path.join(videosDir, safeFileName);

  if (!existsSync(videoPath)) {
    return NextResponse.json({ error: `Arquivo não encontrado: ${safeFileName}` }, { status: 404 });
  }

  const audioPath = path.join(tmpDir, `audio_${Date.now()}.wav`);

  try {
    console.log(`[process-local] Extraindo áudio de ${safeFileName}...`);
    await extractAudio(videoPath, audioPath);

    const durationSeconds = await getVideoDuration(videoPath);

    console.log(`[process-local] Enviando para Whisper... (${(durationSeconds / 60).toFixed(1)} min)`);

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(audioPath) as unknown as File,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word", "segment"],
    });

    const captions = (transcription.words ?? []).map((w) => ({
      text: w.word,
      startMs: Math.round(w.start * 1000),
      endMs: Math.round(w.end * 1000),
      timestampMs: Math.round(w.start * 1000) as number | null,
      confidence: 1 as number | null,
    }));

    const segments = (transcription.segments ?? []).map((s, i) => ({
      index: i,
      text: s.text.trim(),
      startMs: Math.round(s.start * 1000),
      endMs: Math.round(s.end * 1000),
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
      fileName: safeFileName,
      remotionSrc: safeFileName,
    });
  } finally {
    if (existsSync(audioPath)) await unlink(audioPath).catch(() => {});
  }
}
