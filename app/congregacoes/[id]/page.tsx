import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import CongregacaoDashboard from "@/components/cards/CongregacaoDashboard";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

type TerritorioResumo = {
  id: number;
  cidade_id: number | null;
  cidade_referencia: string | null;
  total_enderecos: number | null;
};

type Cidade = {
  id: number;
  nome: string;
};

export default async function CongregacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const congregacaoId = Number(id);

  const { data: congregacao, error: erroCongregacao } =
    await supabase
      .from("congregacoes")
      .select("id, nome, cidade_base, idioma")
      .eq("id", congregacaoId)
      .single();

  if (erroCongregacao || !congregacao) {
    return (
      <main className="min-h-screen bg-[#F4F5F0] p-4 [font-family:var(--font-geist-sans)]">
        <div className="mx-auto max-w-[820px] rounded-[18px] border border-[#B84A4A]/20 bg-[#B84A4A]/8 p-4 text-sm text-[#B84A4A]">
          Não foi possível carregar esta congregação.
        </div>
      </main>
    );
  }

  const { data: territoriosData, error: erroTerritorios } =
    await supabase
      .from("v_territorios_resumo")
      .select(`
        id,
        cidade_id,
        cidade_referencia,
        total_enderecos
      `)
      .eq("congregacao_id", congregacaoId)
      .eq("ativo", true);

  const territorios =
    (territoriosData ?? []) as TerritorioResumo[];

  const cidadesPorId = new Map<number, Cidade>();

  /*
   * Inclui também cidades realmente utilizadas pelos territórios.
   * Isso prepara a tela para uma cidade atender mais de uma congregação.
   */
  for (const territorio of territorios) {
    if (!territorio.cidade_id) continue;

    if (!cidadesPorId.has(territorio.cidade_id)) {
      cidadesPorId.set(territorio.cidade_id, {
        id: territorio.cidade_id,
        nome:
          territorio.cidade_referencia ??
          "Cidade não informada",
      });
    }
  }

  const cidades = Array.from(cidadesPorId.values())
  .map((cidade) => {
    const territoriosDaCidade = territorios.filter(
      (territorio) =>
        territorio.cidade_id === cidade.id
    );

    return {
      ...cidade,
      totalTerritorios: territoriosDaCidade.length,
      totalEnderecos: territoriosDaCidade.reduce(
        (total, territorio) =>
          total + (territorio.total_enderecos ?? 0),
        0
      ),
    };
  })
  .filter((cidade) => cidade.totalTerritorios > 0)
  .sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  const totalTerritorios = territorios.length;

  const totalEnderecos = territorios.reduce(
    (total, territorio) =>
      total + (territorio.total_enderecos ?? 0),
    0
  );

  const { count: totalPublicadores } = await supabase
    .from("publicadores")
    .select("*", { count: "exact", head: true })
    .eq("congregacao_id", congregacaoId)
    .eq("ativo", true);

  const { count: totalGrupos } = await supabase
    .from("grupos")
    .select("*", { count: "exact", head: true })
    .eq("congregacao_id", congregacaoId)
    .eq("ativo", true);

  return (
    <main className="min-h-screen bg-[#F4F5F0] pb-28 text-[#17211C] [font-family:var(--font-geist-sans)]">
      <header className="sticky top-0 z-20 bg-[#123D2C] px-4 py-4 text-white shadow-[0_5px_20px_rgba(11,43,32,0.16)] sm:py-5">
        <div className="mx-auto flex max-w-[820px] items-center gap-3">
          <Link
            href="/"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#DCE8D5] transition hover:bg-white/10 active:scale-95 active:bg-white/15"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#BFD0B8]">
              Congregação
            </p>

            <h1 className="mt-0.5 truncate text-base font-semibold tracking-[-0.01em] sm:text-lg">
              {congregacao.nome}
            </h1>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[820px] space-y-5 px-4 py-5 sm:px-6 sm:py-6">
        <CongregacaoDashboard
          congregacaoId={congregacaoId}
          nome={congregacao.nome}
          cidade={`${congregacao.cidade_base ?? ""} · ${
            congregacao.idioma ?? ""
          }`}
          territorios={totalTerritorios}
          enderecos={totalEnderecos}
          publicadores={totalPublicadores ?? 0}
          grupos={totalGrupos ?? 0}
        />

        <div className="rounded-[22px] border border-[#DDE2DB]/90 bg-white p-4 shadow-[0_5px_20px_rgba(18,61,44,0.055)] sm:p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-[-0.015em] text-[#17211C]">
              Cidades
            </h2>

            <p className="mt-1 text-sm text-[#6F7872]">
              Selecione uma cidade para visualizar seus
              territórios.
            </p>
          </div>

          {erroTerritorios ? (
            <div className="rounded-[16px] border border-[#B84A4A]/20 bg-[#B84A4A]/8 p-4 text-sm text-[#B84A4A]">
              Não foi possível carregar as cidades e os
              territórios.
            </div>
          ) : cidades.length > 0 ? (
            <div className="space-y-2">
              {cidades.map((cidade) => (
                <Link
                  key={cidade.id}
                  href={`/cidades/${cidade.id}?congregacao=${congregacaoId}`}
                  className="group flex items-center gap-3 rounded-[18px] border border-[#DDE2DB] bg-[#FAFBF8] p-3 transition hover:border-[#8FAF72]/60 hover:bg-[#F4F7F1] active:scale-[0.99]"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#DCE8D5] text-[#123D2C]">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[#17211C]">
                      {cidade.nome}
                    </h3>

                    <p className="mt-0.5 text-xs text-[#6F7872]">
                      {cidade.totalTerritorios}{" "}
                      {cidade.totalTerritorios === 1
                        ? "território"
                        : "territórios"}
                      {" · "}
                      {cidade.totalEnderecos}{" "}
                      {cidade.totalEnderecos === 1
                        ? "endereço"
                        : "endereços"}
                    </p>
                  </div>

                  <ChevronRight className="h-5 w-5 shrink-0 text-[#9AA39D] transition group-hover:text-[#2F6B4F]" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[16px] bg-[#E9ECE5]/70 p-4 text-center text-sm text-[#6F7872]">
              Nenhuma cidade vinculada a esta congregação.
            </div>
          )}
        </div>
      </section>

      <MobileBottomNav
        congregacaoId={String(congregacaoId)}
        variant="green"
      />
    </main>
  );
}
