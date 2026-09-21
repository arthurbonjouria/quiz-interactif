import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/require-admin";

export async function GET() {
  const { response } = await requireOwner();
  if (response) return response;

  const requests = await prisma.accessRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(requests);
}
