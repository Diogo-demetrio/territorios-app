import { supabase } from "@/lib/supabase";
import NovoEnderecoForm from "@/components/enderecos/NovoEnderecoForm";
import ListaEnderecosSelecionavel from "@/components/enderecos/ListaEnderecosSelecionavel";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { ArrowLeft, Search, RefreshCw } from "lucide-react";
import {
  calcularProgresso,
  calcularTotaisEnderecos,
} from "@/lib/territorio";

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
  const totais = calcularTotaisEnderecos(lista);
  const progresso = calcularProgresso(lista);

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
        <div className="mb-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                Território
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {territorio?.nome}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {territorio?.bairro} · {territorio?.cidade} ·{" "}
                {congregacao?.nome}
              </p>
            </div>

            <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-bold text-violet-700">
              {totais.total} end.
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            <StatusBadge status="visitado" count={totais.visitado} />
            <StatusBadge status="nao_visitado" count={totais.naoVisitado} />
            <StatusBadge status="nao_atendeu" count={totais.naoAtendeu} />
            <StatusBadge status="novo" count={totais.novo} />
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span>Progresso do território</span>
              <span>{progresso}% visitado</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${progresso}%` }}
              />
            </div>
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