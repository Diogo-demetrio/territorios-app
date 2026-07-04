import { supabase } from "@/lib/supabase";
import NovoEnderecoForm from "@/components/enderecos/NovoEnderecoForm";
import ListaEnderecosSelecionavel from "@/components/enderecos/ListaEnderecosSelecionavel";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { ArrowLeft, Search, RefreshCw } from "lucide-react";

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

  const { data: congregacao } = await supabase
    .from("congregacoes")
    .select("*")
    .eq("id", territorio?.congregacao_id)
    .single();

  const { data: enderecos } = await supabase
    .from("enderecos")
    .select("*")
    .eq("territorio_id", id)
    .order("id");

  const lista = enderecos ?? [];

  const visitado = lista.filter((e) => e.status === "visitado").length;
  const naoVisitado = lista.filter((e) => e.status === "nao_visitado" || !e.status).length;
  const naoAtendeu = lista.filter((e) => e.status === "nao_atendeu").length;
  const novo = lista.filter((e) => e.status === "novo").length;

  return (
    <main className="min-h-screen bg-slate-100 pb-24">
      <header className="sticky top-0 z-20 bg-violet-700 px-4 py-4 text-white shadow">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link
            href={`/congregacoes/${territorio?.congregacao_id}/territorios`}
            className="rounded-full p-2 hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <h1 className="flex-1 text-base font-semibold">
            {territorio?.nome}
          </h1>

          <Search className="h-5 w-5" />
          <RefreshCw className="h-5 w-5" />
        </div>
      </header>

      <section className="mx-auto max-w-3xl p-4">
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-base font-semibold">{territorio?.nome}</h2>

          <p className="mt-0.5 text-xs text-slate-500">
            {territorio?.bairro} · {territorio?.cidade} · {congregacao?.nome}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge status="visitado" count={visitado} />
              <StatusBadge status="nao_visitado" count={naoVisitado} />
              <StatusBadge status="nao_atendeu" count={naoAtendeu} />
              <StatusBadge status="novo" count={novo} />
            </div>

            <span className="rounded-lg bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700">
              {lista.length} end.
            </span>
          </div>
        </div>

        <NovoEnderecoForm
          territorioId={territorio.id}
          cidade={territorio.cidade}
          bairro={territorio.bairro}
          territorioNome={territorio.nome}
        />

        <ListaEnderecosSelecionavel
          enderecos={lista}
          territorio={territorio}
          congregacao={congregacao}
        />
      </section>

      <MobileBottomNav congregacaoId={String(territorio?.congregacao_id)} />
    </main>
  );
}