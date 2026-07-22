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
      <main className="min-h-screen bg-slate-100 p-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
    <main className="min-h-screen bg-slate-100 pb-24">
      <header className="sticky top-0 z-20 bg-violet-700 px-4 py-4 text-white shadow">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link
            href="/"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-white/10"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="min-w-0">
            <p className="text-xs text-violet-100">
              Congregação
            </p>

            <h1 className="truncate text-base font-semibold">
              {congregacao.nome}
            </h1>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl space-y-4 p-4">
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

        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4">
            <h2 className="font-bold text-slate-900">
              Cidades
            </h2>

            <p className="text-sm text-slate-500">
              Selecione uma cidade para visualizar seus
              territórios.
            </p>
          </div>

          {erroTerritorios ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Não foi possível carregar as cidades e os
              territórios.
            </div>
          ) : cidades.length > 0 ? (
            <div className="space-y-2">
              {cidades.map((cidade) => (
                <Link
                  key={cidade.id}
                  href={`/cidades/${cidade.id}?congregacao=${congregacaoId}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-violet-300 hover:bg-violet-50"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {cidade.nome}
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
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

                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">
              Nenhuma cidade vinculada a esta congregação.
            </div>
          )}
        </div>
      </section>

      <MobileBottomNav congregacaoId={String(congregacaoId)} />
    </main>
  );
}