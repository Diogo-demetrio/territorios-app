import { supabase } from "@/lib/supabase";
import StatusEndereco from "@/components/enderecos/StatusEndereco";
import Link from "next/link";

export default async function Territorio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: territorio } = await supabase
    .from("territorios")
    .select("*")
    .eq("id", id)
    .single();

  const { data: enderecos } = await supabase
    .from("enderecos")
    .select("*")
    .eq("territorio_id", id)
    .order("id");

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="mx-auto max-w-xl">

<Link
  href={`/cidades/${territorio?.cidade_id}`}
  className="inline-block mb-6 rounded-lg bg-white px-4 py-2 shadow hover:bg-gray-100"
>
  ← Voltar
</Link>

        <h1 className="mb-2 text-3xl font-bold">
          {territorio?.nome}
        </h1>

        <p className="mb-6 text-gray-500">
          {territorio?.bairro} • {territorio?.cidade}
        </p>

        <div className="space-y-3">
          {enderecos?.map((endereco) => (
            <StatusEndereco
              key={endereco.id}
              endereco={endereco}
            />
          ))}
        </div>
      </div>
    </main>
  );
}