import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isOwner } from "@/lib/require-admin";

export default async function FoldersPage() {
  const session = await auth();
  const owner = isOwner(session);

  const folders = await prisma.folder.findMany({
    where: owner ? {} : { createdById: session?.user?.id },
    orderBy: { createdAt: "desc" },
    include: { campaigns: true, access: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dossiers de cours</h1>
          <p className="text-sm text-neutral-500">
            Regroupez plusieurs campagnes et envoyez les accès par email à vos étudiants en une fois.
          </p>
        </div>
        <Link href="/admin/folders/new" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand">
          + Nouveau dossier
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Dossier</th>
              <th className="px-4 py-3">Cours</th>
              <th className="px-4 py-3">Étudiants invités</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {folders.map((f) => (
              <tr key={f.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium">{f.title}</td>
                <td className="px-4 py-3">{f.campaigns.length}</td>
                <td className="px-4 py-3">{f.access.length}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/folders/${f.id}`} className="text-brand hover:underline">
                    Ouvrir
                  </Link>
                </td>
              </tr>
            ))}
            {folders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                  Aucun dossier pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
