import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { FiltroTerritorios } from "@/components/territorios/FiltroTerritorios";

export default async function TerritoriosDaCongregacao({
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

  const { data: territorios } = await supabase
    .from("territorios")
    .select(`
      id,
      nome,
      cidade,
      bairro,
      ponto_referencia,
      numero
    `)
    .eq("congregacao_id", id)
    .order("bairro")
    .order("numero");

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="mx-auto max-w-xl">
        <Link
          href={`/congregacoes/${id}`}
          className="mb-4 inline-block text-sm text-blue-600"
        >
          ← Voltar
        </Link>

        <h1 className="mb-2 text-3xl font-bold">Territórios</h1>

        <p className="mb-6 text-gray-500">{congregacao?.nome}</p>

        <FiltroTerritorios territorios={territorios ?? []} />
      </div>
    </main>
  );
}