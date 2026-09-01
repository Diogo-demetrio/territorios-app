"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Filter, Layers3, MapPin } from "lucide-react";
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
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

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
  const totalFiltrosAtivos = [cidade, bairro, territorio, status].filter(
    (valor) => valor !== "todos"
  ).length;

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
    <div className="space-y-3">
      <div className="rounded-[18px] border border-[#DDE2DB] bg-white p-3 shadow-[0_4px_16px_rgba(23,33,28,0.04)] sm:p-4">
        <button
          type="button"
          aria-expanded={filtrosAbertos}
          onClick={() => setFiltrosAbertos((abertos) => !abertos)}
          className="flex min-h-11 w-full items-center gap-3 text-left md:hidden"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DCE8D5] text-[#123D2C]">
            <Filter className="h-4 w-4" />
          </span>
          <span className="flex-1 text-sm font-semibold">Filtros</span>
          {totalFiltrosAtivos > 0 && (
            <span className="rounded-full bg-[#123D2C] px-2.5 py-1 text-xs font-semibold text-white">
              {totalFiltrosAtivos}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-[#6F7872] transition ${filtrosAbertos ? "rotate-180" : ""}`} />
        </button>

        <div className={`${filtrosAbertos ? "mt-3 grid" : "hidden"} gap-3 border-t border-[#DDE2DB] pt-3 md:mt-0 md:grid md:grid-cols-4 md:border-0 md:pt-0`}>
          <CampoFiltro label="Cidade">
            <select
              value={cidade}
              onChange={(evento) => {
                setCidade(evento.target.value);
                setBairro("todos");
                setTerritorio("todos");
              }}
              className={selectClasses}
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
              className={selectClasses}
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
              className={selectClasses}
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
              className={selectClasses}
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

        <label className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition md:mt-3 ${filtrosAbertos ? "mt-3" : "mt-2"} ${somenteDuplicados ? "border border-[#B84A4A]/25 bg-[#B84A4A]/8 text-[#8F3636]" : "border border-[#DDE2DB] bg-[#F4F5F0] text-[#17211C]"}`}>
          <input
            type="checkbox"
            checked={somenteDuplicados}
            onChange={(evento) => setSomenteDuplicados(evento.target.checked)}
            className="h-4 w-4 accent-[#B84A4A]"
          />
          <span className="font-medium">Possíveis duplicados</span>
          <span className="ml-auto rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold">
            {totalDuplicados}
          </span>
        </label>
      </div>

      {podeVerLimites && limitesPorIdioma.length > 0 && (
        <details className="group rounded-[16px] border border-[#DDE2DB] bg-white shadow-[0_3px_14px_rgba(23,33,28,0.04)]">
          <summary className="cursor-pointer list-none px-3 py-3 text-sm font-semibold text-[#17211C] sm:px-4">
            <span className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DCE8D5] text-[#123D2C]">
                  <Layers3 className="h-4 w-4" />
                </span>
                Limites de congregações
              </span>
              <span className="flex items-center gap-2 text-xs font-normal text-[#6F7872]">
                {limitesSelecionados.length} selecionado(s)
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
              </span>
            </span>
          </summary>

          <div className="space-y-4 border-t border-[#DDE2DB] px-4 py-4">
            <p className="text-xs text-[#6F7872]">
              Camada apenas visual. A seleção não altera os endereços.
            </p>

            {limitesPorIdioma.map(([idioma, opcoes]) => (
              <fieldset key={idioma}>
                <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#2F6B4F]">
                  {idioma}
                </legend>

                <div className="grid gap-2 sm:grid-cols-2">
                  {opcoes.map((limite) => (
                    <label
                      key={limite.id}
                      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-[#DDE2DB] px-3 py-2.5 text-sm transition hover:border-[#8FAF72]"
                    >
                      <input
                        type="checkbox"
                        checked={limitesSelecionados.includes(limite.id)}
                        onChange={() => alternarLimite(limite.id)}
                        className="h-4 w-4 accent-[#123D2C]"
                      />
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: limite.cor }}
                      />
                      <span className="font-medium text-[#17211C]">
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

      <p className="flex items-center gap-2 px-1 text-sm text-[#6F7872]">
        <MapPin className="h-4 w-4 text-[#2F6B4F]" />
        <span><strong className="font-semibold text-[#17211C]">{filtrados.length}</strong> endereços encontrados</span>
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
      <span className="mb-1 block text-xs font-semibold text-[#6F7872]">
        {label}
      </span>

      <div className="relative">
        {children}

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7872]">
          ▾
        </span>
      </div>
    </label>
  );
}

const selectClasses =
  "h-11 w-full appearance-none rounded-xl border border-[#DDE2DB] bg-white px-3 pr-9 text-sm font-medium text-[#17211C] outline-none transition focus:border-[#2F6B4F] focus:ring-2 focus:ring-[#DCE8D5]";

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
