import { NextResponse } from "next/server";
import { getTodayPassages } from "@/lib/passages-today";

export async function GET() {
  const passages = await getTodayPassages();
  return NextResponse.json({ passages });
}
