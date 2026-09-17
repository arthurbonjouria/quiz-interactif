import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const certificate = await prisma.certificate.findUnique({ where: { attemptId: params.id } });
  if (!certificate) return NextResponse.json({ error: "Certificat introuvable" }, { status: 404 });

  return new NextResponse(certificate.pdfData, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificat-bonjour-ia.pdf"`,
    },
  });
}
