import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isOwner } from "@/lib/require-admin";
import { NewFormateurForm } from "@/components/admin/NewFormateurForm";
import { RemoveFormateurButton } from "@/components/admin/RemoveFormateurButton";
import { AccessRequestActions } from "@/components/admin/AccessRequestActions";

export default async function TeamPage() {
  const session = await auth();
  if (!isOwner(session)) notFound();

  const [team, accessRequests] = await Promise.all([
    prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { campaigns: true, folders: true } } },
    }),
    prisma.accessRequest.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Équipe</h1>
        <p className="text-sm text-neutral-500">
          Chaque formateur ne voit que les campagnes et dossiers qu&apos;il crée lui-même. Vous voyez tout.
        </p>
      </div>

      <NewFormateurForm />

      {accessRequests.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Demandes d&apos;accès en attente ({accessRequests.length})
          </h2>
          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Reçue le</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {accessRequests.map((r) => (
                  <tr key={r.id} className="border-t border-neutral-100">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-neutral-500">{r.email}</td>
                    <td className="max-w-xs px-4 py-3 text-xs text-neutral-400">{r.message ?? "—"}</td>
                    <td className="px-4 py-3 text-neutral-500">{r.createdAt.toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3">
                      <AccessRequestActions id={r.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Campagnes</th>
              <th className="px-4 py-3">Dossiers</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {team.map((u) => (
              <tr key={u.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-neutral-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.role === "OWNER" ? "bg-soft text-brand" : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {u.role === "OWNER" ? "Propriétaire" : "Formateur"}
                  </span>
                </td>
                <td className="px-4 py-3">{u._count.campaigns}</td>
                <td className="px-4 py-3">{u._count.folders}</td>
                <td className="px-4 py-3 text-right">
                  {u.id !== session?.user?.id && <RemoveFormateurButton id={u.id} name={u.name} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
