import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: congregacoes } = await supabase
    .from("congregacoes")
    .select(`
      id,
      nome,
      cidade_base,
      idioma,
      territorios (
        id
      )
    `)
    .eq("ativa", true)
    .order("nome");

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-4xl font-bold">Congregações</h1>

        <div className="space-y-4">
          {congregacoes?.map((congregacao: any) => (
            <Link
              key={congregacao.id}
              href={`/congregacoes/${congregacao.id}`}
              className="block rounded-xl bg-white p-5 shadow hover:bg-slate-50"
            >
              <h2 className="text-xl font-bold">{congregacao.nome}</h2>

              <p className="text-gray-500">
                {congregacao.cidade_base} • {congregacao.idioma}
              </p>

              <p className="mt-2 text-sm font-semibold text-blue-600">
                {congregacao.territorios?.length ?? 0} territórios
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}