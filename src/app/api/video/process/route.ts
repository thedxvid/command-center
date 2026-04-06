import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
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

  const formData = await req.formData();
  const file = formData.get("video") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Nenhum vídeo enviado" }, { status: 400 });
  }

  const videoPath = path.join(tmpDir, `video_${Date.now()}_${file.name}`);
  const audioPath = videoPath.replace(/\.[^.]+$/, ".wav");

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(videoPath, buffer);

    await extractAudio(videoPath, audioPath);
    const durationSeconds = await getVideoDuration(videoPath);

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
      fileName: file.name,
    });
  } finally {
    for (const p of [videoPath, audioPath]) {
      if (existsSync(p)) await unlink(p).catch(() => {});
    }
  }
}
