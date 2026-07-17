import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";

type CidadePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ congregacao?: string }>;
};

export default async function Cidade({
  params,
  searchParams,
}: CidadePageProps) {
  const { id } = await params;
  const { congregacao } = await searchParams;

  const cidadeId = Number(id);
  const congregacaoId = Number(congregacao);

  if (
    !Number.isInteger(cidadeId) ||
    cidadeId <= 0 ||
    !Number.isInteger(congregacaoId) ||
    congregacaoId <= 0
  ) {
    return (
      <main className="min-h-screen bg-slate-100 p-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Os dados da cidade ou da congregação são inválidos.
        </div>
      </main>
    );
  }

  const { data: cidade, error: erroCidade } = await supabase
    .from("cidades")
    .select("id, nome, congregacao_id")
    .eq("id", cidadeId)
    .eq("congregacao_id", congregacaoId)
    .maybeSingle();

  const { data: territorios, error: erroTerritorios } = await supabase
    .from("v_territorios_resumo")
    .select(`
      id,
      nome,
      congregacao_id,
      cidade_id,
      cidade_referencia,
      cidades_presentes,
      bairros_presentes,
      total_bairros,
      total_enderecos,
      total_visitados,
      total_nao_visitados,
      total_nao_atendeu,
      total_novos,
      ativo
    `)
    .eq("cidade_id", cidadeId)
    .eq("congregacao_id", congregacaoId)
    .eq("ativo", true)
    .order("nome");

  if (erroCidade || !cidade) {
    return (
      <main className="min-h-screen bg-slate-100 p-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Não foi possível carregar esta cidade para a congregação selecionada.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 pb-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center gap-3">
          <Link
            href={`/congregacoes/${congregacaoId}`}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200"
            aria-label="Voltar para a congregação"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
              Cidade
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              {cidade.nome}
            </h1>
          </div>
        </div>

        {erroTerritorios ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Não foi possível carregar os territórios.
          </div>
        ) : territorios && territorios.length > 0 ? (
          <div className="space-y-3">
            {territorios.map((territorio) => (
              <Link
                key={territorio.id}
                href={`/territorios/${territorio.id}?congregacao=${congregacaoId}`}
                className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-violet-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900">
                      {territorio.nome}
                    </h2>

                    <div className="mt-1 flex items-start gap-1.5 text-sm text-slate-500">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                      <span>
                        {territorio.bairros_presentes ||
                          "Nenhum bairro informado"}
                      </span>
                    </div>

                    {territorio.total_bairros > 1 && (
                      <p className="mt-1 text-xs font-semibold text-violet-700">
                        {territorio.total_bairros} bairros
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 rounded-lg bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700">
                    {territorio.total_enderecos} end.
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-green-50 px-2 py-1 font-semibold text-green-700">
                    {territorio.total_visitados} visitados
                  </span>

                  <span className="rounded-full bg-red-50 px-2 py-1 font-semibold text-red-700">
                    {territorio.total_nao_visitados} não visitados
                  </span>

                  <span className="rounded-full bg-orange-50 px-2 py-1 font-semibold text-orange-700">
                    {territorio.total_nao_atendeu} não atenderam
                  </span>

                  {territorio.total_novos > 0 && (
                    <span className="rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-700">
                      {territorio.total_novos} novos
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-5 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
            Nenhum território cadastrado nesta cidade.
          </div>
        )}
      </div>
    </main>
  );
}