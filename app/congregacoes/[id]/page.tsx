import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function CongregacaoDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: congregacao } = await supabase
    .from("congregacoes")
    .select("*")
    .eq("id", id)
    .single();

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="mb-4 inline-block text-sm text-blue-600">
          ← Voltar
        </Link>

        <h1 className="mb-2 text-3xl font-bold">{congregacao?.nome}</h1>

        <p className="mb-6 text-gray-500">
          {congregacao?.cidade_base} • {congregacao?.idioma}
        </p>

        <Link
          href={`/congregacoes/${id}/territorios`}
          className="block rounded-xl bg-white p-5 shadow hover:bg-slate-50"
        >
          <h2 className="text-xl font-bold">📁 Territórios</h2>
          <p className="text-gray-500">Ver territórios da congregação</p>
        </Link>
      </div>
    </main>
  );
}