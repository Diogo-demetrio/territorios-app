import Link from "next/link";

export default async function MapaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">

        <Link
          href={`/congregacoes/${id}`}
          className="mb-4 inline-block rounded bg-white px-4 py-2 shadow"
        >
          ← Voltar
        </Link>

        <h1 className="mb-6 text-3xl font-bold">
          Mapa da Congregação
        </h1>

        <div className="rounded-xl bg-white p-10 shadow">
          Em construção...
        </div>

      </div>
    </main>
  );
}