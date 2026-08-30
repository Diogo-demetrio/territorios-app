"use client";

import { useMemo, useState } from "react";
import MapaClient from "@/components/maps/MapaClient";
import type { LimiteCongregacao } from "@/components/maps/types";

export type EnderecoMapa = {
  id: number;
  rua: string | null;
  numero: string | null;
  bairro_id: number | null;
  cidade_id: number | null;
  bairro: string | null;
  cidade: string | null;
  status: string | null;
  ativo?: boolean | null;
  latlong: string | null;
  latitude: number | null;
  longitude: number | null;
  link_google_maps: string | null;
  territorios: {
    id: number;
    nome: string;
    bairro: string | null;
    cidade: string | null;
    congregacao_id: number;
  } | null;
  possivelDuplicado?: boolean;
  territoriosDuplicados?: string[];
};

export default function MapaFiltros({
  enderecos,
  limites,
  podeVerLimites,
}: {
  enderecos: EnderecoMapa[];
  limites: LimiteCongregacao[];
  podeVerLimites: boolean;
}) {
  const [cidade, setCidade] = useState("todos");
  const [bairro, setBairro] = useState("todos");
  const [territorio, setTerritorio] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [somenteDuplicados, setSomenteDuplicados] = useState(false);
  const [limitesSelecionados, setLimitesSelecionados] = useState<number[]>([]);

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
            .filter(
              (endereco) =>
                bairro === "todos" ||
                chaveBairro(endereco) === bairro
            )
            .map(
              (endereco) =>
                endereco.territorios?.nome
            )
            .filter(Boolean)
        )
      ),
    [enderecosAtivos, cidade, bairro]
  );

  const bairros = useMemo(() => {
    const opcoes = new Map<string, string>();

    enderecosAtivos
      .filter(
        (endereco) =>
          cidade === "todos" || endereco.cidade === cidade
      )
      .forEach((endereco) => {
        if (!endereco.bairro) return;
        opcoes.set(chaveBairro(endereco), endereco.bairro);
      });

    return Array.from(opcoes, ([valor, nome]) => ({ valor, nome })).sort(
      (a, b) => a.nome.localeCompare(b.nome, "pt-BR")
    );
  }, [enderecosAtivos, cidade]);

  const duplicadosPorId = useMemo(() => {
    const grupos = new Map<
      string,
      { ids: number[]; territorios: Map<number, string> }
    >();

    enderecosAtivos.forEach((endereco) => {
      const chave = chaveEndereco(endereco);
      const territorioId = Number(endereco.territorios?.id);

      if (!chave || !Number.isInteger(territorioId)) return;

      const grupo = grupos.get(chave) ?? {
        ids: [],
        territorios: new Map<number, string>(),
      };

      grupo.ids.push(endereco.id);
      grupo.territorios.set(
        territorioId,
        endereco.territorios?.nome ?? `Território ${territorioId}`
      );
      grupos.set(chave, grupo);
    });

    const resultado = new Map<number, string[]>();

    grupos.forEach((grupo) => {
      if (grupo.territorios.size < 2) return;
      const nomes = Array.from(grupo.territorios.values()).sort();
      grupo.ids.forEach((id) => resultado.set(id, nomes));
    });

    return resultado;
  }, [enderecosAtivos]);

  const filtrados = useMemo(() => {
    return enderecosAtivos.filter((endereco) => {
      const cidadeOk =
        cidade === "todos" ||
        endereco.cidade === cidade;

      const territorioOk =
        territorio === "todos" ||
        endereco.territorios?.nome === territorio;

      const bairroOk =
        bairro === "todos" || chaveBairro(endereco) === bairro;

      const statusAtual =
        endereco.status || "nao_visitado";

      const statusOk =
        status === "todos" ||
        statusAtual === status;

      const duplicadoOk =
        !somenteDuplicados || duplicadosPorId.has(endereco.id);

      return (
        cidadeOk &&
        bairroOk &&
        territorioOk &&
        statusOk &&
        duplicadoOk
      );
    }).map((endereco) => ({
      ...endereco,
      possivelDuplicado: duplicadosPorId.has(endereco.id),
      territoriosDuplicados: duplicadosPorId.get(endereco.id) ?? [],
    }));
  }, [
    enderecosAtivos,
    cidade,
    bairro,
    territorio,
    status,
    somenteDuplicados,
    duplicadosPorId,
  ]);

  const totalDuplicados = duplicadosPorId.size;

  const limitesPorIdioma = useMemo(() => {
    const grupos = new Map<string, LimiteCongregacao[]>();

    limites.forEach((limite) => {
      const grupo = grupos.get(limite.idioma) ?? [];
      grupo.push(limite);
      grupos.set(limite.idioma, grupo);
    });

    return Array.from(grupos.entries());
  }, [limites]);

  const limitesVisiveis = useMemo(
    () => limites.filter((limite) => limitesSelecionados.includes(limite.id)),
    [limites, limitesSelecionados]
  );

  function alternarLimite(id: number) {
    setLimitesSelecionados((atuais) =>
      atuais.includes(id)
        ? atuais.filter((limiteId) => limiteId !== id)
        : [...atuais, id]
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <CampoFiltro label="Cidade">
            <select
              value={cidade}
              onChange={(evento) => {
                setCidade(evento.target.value);
                setBairro("todos");
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

          <CampoFiltro label="Bairro">
            <select
              value={bairro}
              onChange={(evento) => {
                setBairro(evento.target.value);
                setTerritorio("todos");
              }}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            >
              <option value="todos">Todos os bairros</option>
              {bairros.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.nome}
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

        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-100">
          <input
            type="checkbox"
            checked={somenteDuplicados}
            onChange={(evento) => setSomenteDuplicados(evento.target.checked)}
            className="h-4 w-4 accent-red-600"
          />
          <span className="font-semibold">Somente possíveis duplicados</span>
          <span className="ml-auto text-xs">
            {totalDuplicados} endereço(s)
          </span>
        </label>
      </div>

      {podeVerLimites && limitesPorIdioma.length > 0 && (
        <details className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <summary className="cursor-pointer list-none px-4 py-4 text-sm font-semibold text-slate-700">
            <span className="flex items-center justify-between gap-3">
              Limites de congregações
              <span className="text-xs font-normal text-slate-500">
                {limitesSelecionados.length} selecionado(s) ▾
              </span>
            </span>
          </summary>

          <div className="space-y-4 border-t border-slate-100 px-4 py-4">
            <p className="text-xs text-slate-500">
              Camada apenas visual. A seleção não altera os endereços.
            </p>

            {limitesPorIdioma.map(([idioma, opcoes]) => (
              <fieldset key={idioma}>
                <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {idioma}
                </legend>

                <div className="grid gap-2 sm:grid-cols-2">
                  {opcoes.map((limite) => (
                    <label
                      key={limite.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={limitesSelecionados.includes(limite.id)}
                        onChange={() => alternarLimite(limite.id)}
                        className="h-4 w-4 accent-violet-700"
                      />
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: limite.cor }}
                      />
                      <span className="font-medium text-slate-700">
                        {limite.nome}
                        {limite.numero ? ` · ${limite.numero}` : ""}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </details>
      )}

      <p className="text-sm text-slate-500">
        📍 {filtrados.length} endereços encontrados
      </p>

      <MapaClient enderecos={filtrados} limites={limitesVisiveis} />
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

function normalizar(valor: unknown) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function chaveBairro(endereco: EnderecoMapa) {
  if (endereco.bairro_id) return `id:${endereco.bairro_id}`;

  return `nome:${normalizar(endereco.cidade)}|${normalizar(
    endereco.bairro
  )}`;
}

function chaveEndereco(endereco: EnderecoMapa) {
  const rua = normalizar(endereco.rua);
  const numero = normalizar(endereco.numero);

  if (!rua || !numero) return null;

  const cidade = endereco.cidade_id
    ? `id:${endereco.cidade_id}`
    : normalizar(endereco.cidade);

  return `${cidade}|${chaveBairro(endereco)}|${rua}|${numero}`;
}
