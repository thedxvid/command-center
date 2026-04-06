import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

const VIDEOS_DIR = path.join(process.cwd(), "videos para editar");
const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".avi", ".mkv"];

export async function GET() {
  try {
    const files = await readdir(VIDEOS_DIR);
    const videos = files.filter((f) =>
      VIDEO_EXTENSIONS.includes(path.extname(f).toLowerCase())
    );
    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ videos: [] });
  }
}
