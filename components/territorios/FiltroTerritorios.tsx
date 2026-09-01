"use client";

import Link from "next/link";
import { ChevronRight, MapPin, Search } from "lucide-react";
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
      <div className="mb-6 flex h-12 items-center gap-3 rounded-[14px] border border-[#DDE2DB] bg-white px-4 shadow-[0_3px_14px_rgba(18,61,44,0.04)] transition focus-within:border-[#8FAF72] focus-within:ring-3 focus-within:ring-[#8FAF72]/20">
        <Search className="h-4.5 w-4.5 shrink-0 text-[#2F6B4F]" />

        <input
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar território, cidade ou bairro"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#17211C] outline-none placeholder:text-[#8B948E]"
        />
      </div>

      {territoriosFiltrados.length === 0 && (
        <div className="rounded-[18px] border border-[#DDE2DB]/80 bg-white p-5 text-center text-sm text-[#6F7872] shadow-[0_4px_16px_rgba(18,61,44,0.04)]">
          Nenhum território encontrado.
        </div>
      )}

      {Object.entries(agrupadosPorCidade).map(([cidade, lista]) => (
        <section key={cidade} className="mb-7">
          <h2 className="mb-3 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#2F6B4F]">
            <MapPin className="h-4 w-4" strokeWidth={2} />
            {cidade}
          </h2>

          <div className="space-y-3">
            {lista.map((territorio) => (
              <Link
                key={territorio.id}
                href={`/territorios/${territorio.id}`}
                className="group block rounded-[19px] border border-[#DDE2DB]/90 bg-white p-4 shadow-[0_4px_16px_rgba(18,61,44,0.045)] transition duration-200 hover:-translate-y-0.5 hover:border-[#8FAF72]/60 hover:shadow-[0_8px_24px_rgba(18,61,44,0.085)] active:scale-[0.99] active:bg-[#FAFBF8]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold leading-snug text-[#17211C] sm:text-base">
                      {territorio.nome}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#6F7872] sm:text-sm">
                      {territorio.bairros_presentes ||
                        territorio.bairro_referencia ||
                        "Nenhum bairro informado"}
                    </p>

                    {territorio.total_bairros > 1 && (
                      <p className="mt-1.5 text-[11px] font-medium text-[#2F6B4F]">
                        {territorio.total_bairros} bairros neste território
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 rounded-full bg-[#DCE8D5] px-2.5 py-1.5 text-xs font-semibold text-[#123D2C]">
                    {territorio.total_enderecos} end.
                  </span>
                </div>

                <div className="mt-3.5 flex items-end justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
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

                  <ChevronRight className="mb-1 h-5 w-5 shrink-0 text-[#9AA39D] transition group-hover:text-[#2F6B4F]" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
