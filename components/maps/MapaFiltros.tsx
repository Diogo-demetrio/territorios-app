"use client";

import { useMemo, useState } from "react";
import MapaClient from "@/components/maps/MapaClient";

export default function MapaFiltros({
  enderecos,
}: {
  enderecos: any[];
}) {
  const [cidade, setCidade] = useState("todos");
  const [territorio, setTerritorio] = useState("todos");
  const [status, setStatus] = useState("todos");

  /*
   * Proteção adicional:
   * somente endereços ativos podem aparecer no mapa.
   *
   * O teste !== false mantém compatibilidade com registros antigos
   * em que o campo ativo eventualmente esteja nulo ou ausente.
   */
  const enderecosAtivos = useMemo(
    () =>
      enderecos.filter(
        (endereco) => endereco.ativo !== false
      ),
    [enderecos]
  );

  const cidades = useMemo(
    () =>
      Array.from(
        new Set(
          enderecosAtivos
            .map((endereco) => endereco.cidade)
            .filter(Boolean)
        )
      ),
    [enderecosAtivos]
  );

  const territorios = useMemo(
    () =>
      Array.from(
        new Set(
          enderecosAtivos
            .filter(
              (endereco) =>
                cidade === "todos" ||
                endereco.cidade === cidade
            )
            .map(
              (endereco) =>
                endereco.territorios?.nome
            )
            .filter(Boolean)
        )
      ),
    [enderecosAtivos, cidade]
  );

  const filtrados = useMemo(() => {
    return enderecosAtivos.filter((endereco) => {
      const cidadeOk =
        cidade === "todos" ||
        endereco.cidade === cidade;

      const territorioOk =
        territorio === "todos" ||
        endereco.territorios?.nome === territorio;

      const statusAtual =
        endereco.status || "nao_visitado";

      const statusOk =
        status === "todos" ||
        statusAtual === status;

      return (
        cidadeOk &&
        territorioOk &&
        statusOk
      );
    });
  }, [
    enderecosAtivos,
    cidade,
    territorio,
    status,
  ]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 md:grid-cols-3">
          <CampoFiltro label="Cidade">
            <select
              value={cidade}
              onChange={(evento) => {
                setCidade(evento.target.value);
                setTerritorio("todos");
              }}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            >
              <option value="todos">
                Todas as cidades
              </option>

              {cidades.map((nomeCidade) => (
                <option
                  key={String(nomeCidade)}
                  value={String(nomeCidade)}
                >
                  {String(nomeCidade)}
                </option>
              ))}
            </select>
          </CampoFiltro>

          <CampoFiltro label="Território">
            <select
              value={territorio}
              onChange={(evento) =>
                setTerritorio(evento.target.value)
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            >
              <option value="todos">
                Todos os territórios
              </option>

              {territorios.map(
                (nomeTerritorio) => (
                  <option
                    key={String(nomeTerritorio)}
                    value={String(nomeTerritorio)}
                  >
                    {String(nomeTerritorio)}
                  </option>
                )
              )}
            </select>
          </CampoFiltro>

          <CampoFiltro label="Status">
            <select
              value={status}
              onChange={(evento) =>
                setStatus(evento.target.value)
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            >
              <option value="todos">
                Todos os status
              </option>

              <option value="visitado">
                Visitado
              </option>

              <option value="nao_visitado">
                Não visitado
              </option>

              <option value="nao_atendeu">
                Não atendeu
              </option>

              <option value="novo">
                Novo
              </option>
            </select>
          </CampoFiltro>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        📍 {filtrados.length} endereços encontrados
      </p>

      <MapaClient enderecos={filtrados} />
    </div>
  );
}

function CampoFiltro({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">
        {label}
      </span>

      <div className="relative">
        {children}

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          ▾
        </span>
      </div>
    </label>
  );
}