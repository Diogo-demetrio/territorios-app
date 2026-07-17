import { supabase } from "@/lib/supabase";
import CongregacaoCard from "@/components/cards/CongregacaoCard";
import { Search, RefreshCw } from "lucide-react";
import { APP_VERSION } from "@/lib/version";

export default async function Home() {
  const { data: congregacoes } = await supabase
    .from("congregacoes")
    .select("*")
    .order("nome");

  const cards =
    (await Promise.all(
      (congregacoes ?? []).map(async (c) => {
        const { count: totalTerritorios } = await supabase
          .from("territorios")
          .select("*", { count: "exact", head: true })
          .eq("congregacao_id", c.id);

        const { data: territorios } = await supabase
          .from("territorios")
          .select("id")
          .eq("congregacao_id", c.id);

        const ids = territorios?.map((t) => t.id) ?? [];

        let totalEnderecos = 0;

        if (ids.length) {
          const { count } = await supabase
            .from("enderecos")
            .select("*", { count: "exact", head: true })
            .in("territorio_id", ids);

          totalEnderecos = count ?? 0;
        }

        return {
          ...c,
          totalTerritorios: totalTerritorios ?? 0,
          totalEnderecos,
        };
      })
    )) ?? [];

  return (
    <main className="min-h-screen bg-slate-100">

      <header className="sticky top-0 z-20 bg-violet-700 px-6 py-5 text-white shadow">

        <div className="mx-auto flex max-w-3xl items-center justify-between">

          <div className="flex items-center gap-3">

  <h1 className="text-xl font-semibold">
    Congregações
  </h1>

  <span className="rounded-md bg-violet-600/40 px-2 py-0.5 text-xs font-medium text-violet-100 border border-violet-400/30">
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

        <div className="space-y-5">

          {cards.map((c) => (
            <CongregacaoCard
              key={c.id}
              congregacao={c}
            />
          ))}

        </div>

      </section>

    </main>
  );
}