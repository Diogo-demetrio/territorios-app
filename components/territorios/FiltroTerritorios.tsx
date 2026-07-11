"use client";

import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";

type TerritorioResumo = {
  id: number;
  nome: string;
  numero: number | null;
  congregacao_id: number;
  cidade_referencia: string | null;
  bairro_referencia: string | null;
  cidades_presentes: string | null;
  bairros_presentes: string | null;
  total_cidades: number;
  total_bairros: number;
  total_enderecos: number;
  total_visitados: number;
  total_nao_visitados: number;
  total_nao_atendeu: number;
  total_novos: number;
  ativo: boolean;
  status_designacao: string | null;
};

type Props = {
  territorios: TerritorioResumo[];
};

export function FiltroTerritorios({ territorios }: Props) {
  const [busca, setBusca] = useState("");

  const territoriosFiltrados = useMemo(() => {
    const textoBusca = busca.trim().toLowerCase();

    if (!textoBusca) return territorios;

    return territorios.filter((territorio) => {
      const textoCompleto = [
        territorio.nome,
        territorio.cidade_referencia,
        territorio.bairro_referencia,
        territorio.cidades_presentes,
        territorio.bairros_presentes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return textoCompleto.includes(textoBusca);
    });
  }, [busca, territorios]);

  const agrupadosPorCidade = useMemo(() => {
    return territoriosFiltrados.reduce<
      Record<string, TerritorioResumo[]>
    >((grupos, territorio) => {
      const cidade =
        territorio.cidade_referencia ||
        territorio.cidades_presentes ||
        "Sem cidade definida";

      if (!grupos[cidade]) {
        grupos[cidade] = [];
      }

      grupos[cidade].push(territorio);
      return grupos;
    }, {});
  }, [territoriosFiltrados]);

  return (
    <>
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200">
        <Search className="h-4 w-4 text-slate-500" />

        <input
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar território, cidade ou bairro"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
        />
      </div>

      {territoriosFiltrados.length === 0 && (
        <div className="rounded-2xl bg-white p-4 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
          Nenhum território encontrado.
        </div>
      )}

      {Object.entries(agrupadosPorCidade).map(([cidade, lista]) => (
        <section key={cidade} className="mb-6">
          <h2 className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {cidade}
          </h2>

          <div className="space-y-3">
            {lista.map((territorio) => (
              <Link
                key={territorio.id}
                href={`/territorios/${territorio.id}`}
                className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-violet-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {territorio.nome}
                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {territorio.bairros_presentes ||
                        territorio.bairro_referencia ||
                        "Nenhum bairro informado"}
                    </p>

                    {territorio.total_bairros > 1 && (
                      <p className="mt-1 text-[11px] font-medium text-violet-700">
                        {territorio.total_bairros} bairros neste território
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 rounded-lg bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700">
                    {territorio.total_enderecos} end.
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <StatusBadge
                    status="visitado"
                    count={territorio.total_visitados}
                  />

                  <StatusBadge
                    status="nao_visitado"
                    count={territorio.total_nao_visitados}
                  />

                  <StatusBadge
                    status="nao_atendeu"
                    count={territorio.total_nao_atendeu}
                  />

                  <StatusBadge
                    status="novo"
                    count={territorio.total_novos}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}