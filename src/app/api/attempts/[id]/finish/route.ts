import { NextResponse } from "next/server";
import { finishAttempt } from "@/lib/finish-attempt";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const result = await finishAttempt(params.id);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Tentative introuvable" }, { status: 404 });
  }
}
