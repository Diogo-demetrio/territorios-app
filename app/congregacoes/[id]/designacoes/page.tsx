import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";

export default async function DesignacoesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-slate-100 p-4 pb-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center gap-3">
          <Link
            href={`/congregacoes/${id}`}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
              Congregação
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Designações
            </h1>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
            <ClipboardList className="h-5 w-5" />
          </div>

          <h2 className="font-bold text-slate-900">
            Gestão de designações
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Esta funcionalidade será implementada na próxima etapa.
          </p>
        </div>
      </div>
    </main>
  );
}