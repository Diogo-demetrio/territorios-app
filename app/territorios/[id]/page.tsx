import Link from "next/link";
import { EnderecoActions } from "@/components/enderecos/EnderecoActions";
import { StatusEndereco } from "@/components/enderecos/StatusEndereco";
import { supabase } from "@/lib/supabase";

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
        <Link href="/" className="mb-4 inline-block text-sm text-blue-600">
          ← Voltar
        </Link>

        <h1 className="mb-2 text-3xl font-bold">{territorio?.nome}</h1>

        <p className="mb-6 text-gray-500">
          {territorio?.bairro} • {territorio?.cidade}
        </p>

        <div className="space-y-4">
          {enderecos?.map((endereco) => {
            const texto = `${endereco.rua}, ${endereco.numero}, ${endereco.bairro}, ${endereco.cidade}`;

            return (
              <div key={endereco.id} className="rounded-xl bg-white p-4 shadow">
                <div className="text-lg font-semibold">
                  {endereco.rua}, {endereco.numero}
                </div>

                <div className="text-sm text-gray-500">
                  {endereco.bairro} • {endereco.cidade}
                </div>

                <StatusEndereco
                  enderecoId={endereco.id}
                  statusAtual={endereco.status ?? "nao_visitado"}
                />

                <EnderecoActions texto={texto} />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}