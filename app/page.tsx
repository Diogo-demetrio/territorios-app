import { supabase } from "@/lib/supabase";
import CongregacaoCard from "@/components/cards/CongregacaoCard";
import { Search, RefreshCw } from "lucide-react";
import { APP_VERSION } from "@/lib/version";
import { connection } from "next/server";

export default async function Home() {
  await connection();

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
    <main className="min-h-screen bg-[#F4F5F0] text-[#17211C]">
      <header className="sticky top-0 z-20 bg-[#123D2C] px-4 py-5 text-white shadow-[0_6px_22px_rgba(11,43,32,0.16)] sm:py-6">
        <div className="mx-auto flex max-w-[720px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <h1 className="truncate text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
              Congregações
            </h1>

            <span className="shrink-0 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-[#DCE8D5]">
              {APP_VERSION}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              aria-label="Buscar congregação"
              className="grid h-10 w-10 place-items-center rounded-xl text-[#DCE8D5] transition hover:bg-white/10 active:scale-95 active:bg-white/15"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Atualizar congregações"
              className="grid h-10 w-10 place-items-center rounded-xl text-[#DCE8D5] transition hover:bg-white/10 active:scale-95 active:bg-white/15"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[720px] px-4 pb-10 pt-7 sm:pt-9">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-[#17211C] sm:text-[28px]">
            Escolha uma congregação
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-[#6F7872] sm:text-base">
            Selecione a congregação que deseja acessar.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-[18px] border border-[#B84A4A]/20 bg-[#B84A4A]/8 p-4 text-sm text-[#B84A4A]">
            Não foi possível carregar as congregações.
          </div>
        )}

        <div className="space-y-3.5">
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
