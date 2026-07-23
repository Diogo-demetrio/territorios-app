import { supabase } from "@/lib/supabase";
import CongregacaoCard from "@/components/cards/CongregacaoCard";
import { Search, RefreshCw } from "lucide-react";
import { APP_VERSION } from "@/lib/version";

export default async function Home() {
  const { data: congregacoes, error } = await supabase
    .from("v_congregacoes_resumo")
    .select("*")
    .order("nome");

  const cards = (congregacoes ?? []).map((congregacao) => ({
    ...congregacao,

    totalTerritorios:
      congregacao.total_territorios ?? 0,

    totalEnderecos:
      congregacao.total_enderecos ?? 0,
  }));

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 bg-violet-700 px-6 py-5 text-white shadow">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">
              Congregações
            </h1>

            <span className="rounded-md border border-violet-400/30 bg-violet-600/40 px-2 py-0.5 text-xs font-medium text-violet-100">
              {APP_VERSION}
            </span>
          </div>

          <div className="flex gap-5">
            <Search className="h-5 w-5 cursor-pointer" />
            <RefreshCw className="h-5 w-5 cursor-pointer" />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl p-6">
        <p className="mb-5 text-slate-500">
          Selecione uma congregação para continuar.
        </p>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Não foi possível carregar as congregações.
          </div>
        )}

        <div className="space-y-5">
          {cards.map((congregacao) => (
            <CongregacaoCard
              key={congregacao.id}
              congregacao={congregacao}
            />
          ))}
        </div>
      </section>
    </main>
  );
}