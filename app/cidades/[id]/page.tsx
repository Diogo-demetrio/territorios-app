import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function Cidade({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  const { data: cidade } = await supabase
    .from("cidades")
    .select("*")
    .eq("id", id)
    .single();

  const { data: territorios } = await supabase
    .from("territorios")
    .select("*")
    .eq("cidade_id", id)
    .order("numero");

  return (
    <main className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-xl mx-auto">

        <h1 className="text-4xl font-bold mb-2">
          {cidade?.nome}
        </h1>

        <p className="mb-6 text-gray-500">
          Territórios disponíveis
        </p>

        <div className="space-y-4">

          {territorios?.map((territorio) => (

            <Link
              key={territorio.id}
              href={`/territorios/${territorio.id}`}
            >
              <div className="rounded-xl bg-white p-5 shadow hover:shadow-lg cursor-pointer">

                <h2 className="text-xl font-semibold">
                  {territorio.nome}
                </h2>

                <p className="text-gray-500">
                  {territorio.bairro}
                </p>

              </div>

            </Link>

          ))}

        </div>

      </div>

    </main>
  );
}