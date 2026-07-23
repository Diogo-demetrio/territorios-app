"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, X } from "lucide-react";

import { supabase } from "@/lib/supabase";

type Cidade = {
  id: number;
  nome: string;
};

type Bairro = {
  id: number;
  cidade_id: number;
  nome: string;
  ativo: boolean;
};

type Territorio = {
  id: number;
  congregacao_id: number;
  cidade_id: number | null;
  nome: string;
  ativo: boolean;
};

export type EnderecoEdicao = {
  id: number;
  territorio_id: number;
  cidade_id: number | null;
  bairro_id: number | null;
  numero_sequencial: number | null;
  tipo: string | null;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  cidade: string | null;
  bairro: string | null;
  latlong: string | null;
  latitude: number | null;
  longitude: number | null;
  observacoes: string | null;
  status: string | null;
  ativo: boolean | null;
};

type Props = {
  aberto: boolean;
  congregacaoId: number;
  territorioInicialId: number;
  endereco?: EnderecoEdicao | null;
  fechar: () => void;
  aoSalvar: () => Promise<void> | void;
};

const STATUS = [
  {
    value: "novo",
    label: "Novo",
  },
  {
    value: "nao_visitado",
    label: "Não visitado",
  },
  {
    value: "nao_atendeu",
    label: "Não atendeu",
  },
  {
    value: "visitado",
    label: "Visitado",
  },
];

export default function EnderecoDialog({
  aberto,
  congregacaoId,
  territorioInicialId,
  endereco = null,
  fechar,
  aoSalvar,
}: Props) {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [territorios, setTerritorios] = useState<Territorio[]>([]);

  const [cidadeId, setCidadeId] = useState("");
  const [bairroId, setBairroId] = useState("");
  const [territorioId, setTerritorioId] = useState("");

  const [tipo, setTipo] = useState("Casa");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [latlong, setLatlong] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [status, setStatus] = useState("novo");

  const [carregandoOpcoes, setCarregandoOpcoes] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const editando = Boolean(endereco?.id);

  const bairrosDaCidade = useMemo(() => {
    if (!cidadeId) return [];

    return bairros.filter(
      (bairro) =>
        bairro.cidade_id === Number(cidadeId) &&
        bairro.ativo
    );
  }, [bairros, cidadeId]);

  const territoriosDaCidade = useMemo(() => {
    if (!cidadeId) return [];

    return territorios.filter(
      (territorio) =>
        territorio.congregacao_id === congregacaoId &&
        territorio.cidade_id === Number(cidadeId) &&
        territorio.ativo
    );
  }, [territorios, congregacaoId, cidadeId]);

  useEffect(() => {
    if (!aberto) return;

    carregarOpcoes();
  }, [aberto, congregacaoId]);

  useEffect(() => {
    if (!aberto) return;

    if (endereco) {
      setCidadeId(
        endereco.cidade_id
          ? String(endereco.cidade_id)
          : ""
      );

      setBairroId(
        endereco.bairro_id
          ? String(endereco.bairro_id)
          : ""
      );

      setTerritorioId(String(endereco.territorio_id));

      setTipo(endereco.tipo || "Casa");
      setRua(endereco.rua || "");
      setNumero(endereco.numero || "");
      setComplemento(endereco.complemento || "");
      setLatlong(endereco.latlong || "");
      setObservacoes(endereco.observacoes || "");
      setStatus(endereco.status || "nao_visitado");
    } else {
      setCidadeId("");
      setBairroId("");
      setTerritorioId(String(territorioInicialId));
      setTipo("Casa");
      setRua("");
      setNumero("");
      setComplemento("");
      setLatlong("");
      setObservacoes("");
      setStatus("novo");
    }
  }, [aberto, endereco, territorioInicialId]);

  useEffect(() => {
    if (
      !aberto ||
      editando ||
      cidadeId ||
      territorios.length === 0
    ) {
      return;
    }

    const territorioInicial = territorios.find(
      (territorio) =>
        territorio.id === territorioInicialId
    );

    if (territorioInicial?.cidade_id) {
      setCidadeId(String(territorioInicial.cidade_id));
    }
  }, [
    aberto,
    editando,
    cidadeId,
    territorios,
    territorioInicialId,
  ]);

  async function carregarOpcoes() {
    setCarregandoOpcoes(true);

    const [
      resultadoCidades,
      resultadoBairros,
      resultadoTerritorios,
    ] = await Promise.all([
      supabase
        .from("cidades")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome"),

      supabase
        .from("bairros")
        .select("id, cidade_id, nome, ativo")
        .order("nome"),

      supabase
        .from("territorios")
        .select(`
          id,
          congregacao_id,
          cidade_id,
          nome,
          ativo
        `)
        .eq("congregacao_id", congregacaoId)
        .eq("ativo", true)
        .order("nome"),
    ]);

    setCarregandoOpcoes(false);

    if (resultadoCidades.error) {
      console.error(resultadoCidades.error);
      alert("Não foi possível carregar as cidades.");
      return;
    }

    if (resultadoBairros.error) {
      console.error(resultadoBairros.error);
      alert("Não foi possível carregar os bairros.");
      return;
    }

    if (resultadoTerritorios.error) {
      console.error(resultadoTerritorios.error);
      alert("Não foi possível carregar os territórios.");
      return;
    }

    setCidades(
      (resultadoCidades.data ?? []) as Cidade[]
    );

    setBairros(
      (resultadoBairros.data ?? []) as Bairro[]
    );

    setTerritorios(
      (resultadoTerritorios.data ?? []) as Territorio[]
    );
  }

  function alterarCidade(novoCidadeId: string) {
    setCidadeId(novoCidadeId);
    setBairroId("");

    const territorioAtual = territorios.find(
      (territorio) =>
        territorio.id === Number(territorioId)
    );

    if (
      territorioAtual?.cidade_id !==
      Number(novoCidadeId)
    ) {
      setTerritorioId("");
    }
  }

  function usarLocalizacao() {
    if (!navigator.geolocation) {
      alert(
        "A localização não está disponível neste dispositivo."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        const latitude = posicao.coords.latitude;
        const longitude = posicao.coords.longitude;

        setLatlong(`${latitude},${longitude}`);
      },
      () => {
        alert(
          "Não foi possível obter a localização."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  function converterCoordenadas() {
    const valor = latlong.trim();

    if (!valor) {
      return {
        latitude: null,
        longitude: null,
        latlong: null,
      };
    }

    const partes = valor.split(",");

    if (partes.length !== 2) {
      throw new Error(
        "Use o formato latitude,longitude."
      );
    }

    const latitude = Number(partes[0].trim());
    const longitude = Number(partes[1].trim());

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error(
        "As coordenadas informadas são inválidas."
      );
    }

    return {
      latitude,
      longitude,
      latlong: `${latitude},${longitude}`,
    };
  }

  async function buscarMenorNumeroSequencial(
    idTerritorio: number
  ) {
    const { data, error } = await supabase
      .from("enderecos")
      .select("numero_sequencial")
      .eq("territorio_id", idTerritorio)
      .not("numero_sequencial", "is", null)
      .order("numero_sequencial");

    if (error) {
      console.error(error);

      throw new Error(
        "Não foi possível calcular a sequência do endereço."
      );
    }

    const numerosUsados = new Set(
      (data ?? [])
        .map((item) =>
          Number(item.numero_sequencial)
        )
        .filter(
          (valor) =>
            Number.isInteger(valor) && valor > 0
        )
    );

    let proximo = 1;

    while (numerosUsados.has(proximo)) {
      proximo += 1;
    }

    return proximo;
  }

  async function verificarDuplicidade() {
    let consulta = supabase
      .from("enderecos")
      .select(`
        id,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        status,
        territorio_id,
        territorios (
          nome
        )
      `)
      .eq("cidade_id", Number(cidadeId))
      .ilike("rua", rua.trim())
      .ilike("numero", numero.trim());

    if (endereco?.id) {
      consulta = consulta.neq(
        "id",
        endereco.id
      );
    }

    const { data, error } =
      await consulta.limit(10);

    if (error) {
      console.error(error);

      throw new Error(
        "Não foi possível conferir possíveis duplicidades."
      );
    }

    return data ?? [];
  }

  async function inativarEndereco() {
  if (!endereco?.id) return;

  const confirmar = window.confirm(
    `Inativar o endereço "${endereco.rua}, ${endereco.numero}"?\n\n` +
      "Ele deixará de aparecer na lista normal, mas continuará salvo no sistema."
  );

  if (!confirmar) return;

  setSalvando(true);

  try {
    const { data, error } = await supabase
      .from("enderecos")
      .update({ ativo: false })
      .eq("id", endereco.id)
      .select("id, ativo")
      .maybeSingle();

    if (error) {
      console.error("Erro ao inativar:", error);

      alert(
        `Erro ao inativar endereço: ${error.message}`
      );

      return;
    }

    if (!data) {
      alert(
        "O endereço não foi alterado. O usuário não possui permissão para inativar este registro."
      );

      return;
    }

    if (data.ativo !== false) {
      alert(
        "A alteração não foi confirmada pelo banco de dados."
      );

      return;
    }

    fechar();
    await aoSalvar();
  } catch (error) {
    console.error(error);

    alert(
      "Não foi possível inativar o endereço."
    );
  } finally {
    setSalvando(false);
  }
}

  async function salvar() {
    const ruaLimpa = rua.trim().replace(/\s+/g, " ");
    const numeroLimpo = numero
      .trim()
      .replace(/\s+/g, " ");

    if (!cidadeId) {
      alert("Selecione a cidade.");
      return;
    }

    if (!bairroId) {
      alert("Selecione o bairro.");
      return;
    }

    if (!territorioId) {
      alert("Selecione o território.");
      return;
    }

    if (!ruaLimpa) {
      alert("Informe o logradouro.");
      return;
    }

    if (!numeroLimpo) {
      alert("Informe o número ou S/N.");
      return;
    }

    setSalvando(true);

    try {
      const coordenadas = converterCoordenadas();

      const cidadeSelecionada = cidades.find(
        (cidade) =>
          cidade.id === Number(cidadeId)
      );

      const bairroSelecionado = bairros.find(
        (bairro) =>
          bairro.id === Number(bairroId)
      );

      const territorioSelecionado =
        territorios.find(
          (territorio) =>
            territorio.id === Number(territorioId)
        );

      if (!cidadeSelecionada) {
        throw new Error(
          "A cidade selecionada não foi encontrada."
        );
      }

      if (!bairroSelecionado) {
        throw new Error(
          "O bairro selecionado não foi encontrado."
        );
      }

      if (!territorioSelecionado) {
        throw new Error(
          "O território selecionado não foi encontrado."
        );
      }

      const duplicados =
        await verificarDuplicidade();

      if (duplicados.length > 0) {
        const detalhes = duplicados
          .slice(0, 5)
          .map((item: any) => {
            const territorioNome =
              item.territorios?.nome ??
              `Território ${item.territorio_id}`;

            return (
              `• ${item.rua}, ${item.numero}` +
              `${
                item.complemento
                  ? ` — ${item.complemento}`
                  : ""
              }` +
              `\n  ${item.bairro} — ${territorioNome}`
            );
          })
          .join("\n\n");

        const confirmar = window.confirm(
          `Encontramos ${duplicados.length} possível(is) endereço(s) semelhante(s):\n\n` +
            `${detalhes}\n\n` +
            "Deseja salvar mesmo assim?"
        );

        if (!confirmar) {
          return;
        }
      }

      const territorioFoiAlterado =
        editando &&
        endereco &&
        endereco.territorio_id !==
          Number(territorioId);

      let numeroSequencial =
        endereco?.numero_sequencial ?? null;

      if (!editando || territorioFoiAlterado) {
        numeroSequencial =
          await buscarMenorNumeroSequencial(
            Number(territorioId)
          );
      }

      const dados = {
        territorio_id: Number(territorioId),
        numero_sequencial: numeroSequencial,
        cidade_id: Number(cidadeId),
        bairro_id: Number(bairroId),

        cidade: cidadeSelecionada.nome,
        bairro: bairroSelecionado.nome,

        tipo,
        rua: ruaLimpa,
        numero: numeroLimpo,
        complemento:
          complemento.trim() || null,

        latlong: coordenadas.latlong,
        latitude: coordenadas.latitude,
        longitude: coordenadas.longitude,

        observacoes:
          observacoes.trim() || null,

        status,
      };

      if (editando && endereco) {
        const { error } = await supabase
          .from("enderecos")
          .update(dados)
          .eq("id", endereco.id);

        if (error) {
          console.error(error);

          alert(
            `Erro ao editar endereço: ${error.message}`
          );

          return;
        }
      } else {
        const { error } = await supabase
          .from("enderecos")
          .insert({
            ...dados,
            ativo: true,
          });

        if (error) {
          console.error(error);

          alert(
            `Erro ao criar endereço: ${error.message}`
          );

          return;
        }
      }

      await aoSalvar();
      fechar();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ||
          "Não foi possível salvar o endereço."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6">
      <div className="my-auto w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b bg-violet-700 px-5 py-4 text-white">
          <div>
            <p className="text-xs opacity-80">
              {editando
                ? "Editar endereço"
                : "Novo endereço"}
            </p>

            <h2 className="text-lg font-bold">
              {editando
                ? `${endereco?.rua ?? ""}, ${
                    endereco?.numero ?? ""
                  }`
                : "Cadastrar endereço"}
            </h2>
          </div>

          <button
            type="button"
            onClick={fechar}
            disabled={salvando}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto p-5">
          {carregandoOpcoes ? (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              Carregando opções...
            </div>
          ) : (
            <>
              <Campo label="Cidade">
                <select
                  value={cidadeId}
                  onChange={(event) =>
                    alterarCidade(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                >
                  <option value="">
                    Selecione
                  </option>

                  {cidades.map((cidade) => (
                    <option
                      key={cidade.id}
                      value={cidade.id}
                    >
                      {cidade.nome}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo label="Bairro">
                <select
                  value={bairroId}
                  onChange={(event) =>
                    setBairroId(event.target.value)
                  }
                  disabled={!cidadeId}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm disabled:bg-slate-100"
                >
                  <option value="">
                    Selecione
                  </option>

                  {bairrosDaCidade.map(
                    (bairro) => (
                      <option
                        key={bairro.id}
                        value={bairro.id}
                      >
                        {bairro.nome}
                      </option>
                    )
                  )}
                </select>
              </Campo>

              <Campo label="Território">
                <select
                  value={territorioId}
                  onChange={(event) =>
                    setTerritorioId(
                      event.target.value
                    )
                  }
                  disabled={!cidadeId}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm disabled:bg-slate-100"
                >
                  <option value="">
                    Selecione
                  </option>

                  {territoriosDaCidade.map(
                    (territorio) => (
                      <option
                        key={territorio.id}
                        value={territorio.id}
                      >
                        {territorio.nome}
                      </option>
                    )
                  )}
                </select>
              </Campo>

              <Campo label="Tipo">
                <select
                  value={tipo}
                  onChange={(event) =>
                    setTipo(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                >
                  <option value="Casa">
                    Casa
                  </option>

                  <option value="Apartamento">
                    Apartamento
                  </option>

                  <option value="Kitnet">
                    Kitnet
                  </option>

                  <option value="Comércio">
                    Comércio
                  </option>

                  <option value="Outro">
                    Outro
                  </option>
                </select>
              </Campo>

              <Campo label="Logradouro / Rua">
                <input
                  value={rua}
                  onChange={(event) =>
                    setRua(event.target.value)
                  }
                  placeholder="Ex.: Rua Luís Zilli"
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                />
              </Campo>

              <div className="grid grid-cols-2 gap-3">
                <Campo label="Número">
                  <input
                    value={numero}
                    onChange={(event) =>
                      setNumero(event.target.value)
                    }
                    placeholder="128 ou S/N"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                  />
                </Campo>

                <Campo label="Complemento">
                  <input
                    value={complemento}
                    onChange={(event) =>
                      setComplemento(
                        event.target.value
                      )
                    }
                    placeholder="Casa azul"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                  />
                </Campo>
              </div>

              <Campo label="Coordenadas">
                <div className="flex gap-2">
                  <input
                    value={latlong}
                    onChange={(event) =>
                      setLatlong(event.target.value)
                    }
                    placeholder="-28.7132,-49.2891"
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 p-3 text-sm"
                  />

                  <button
                    type="button"
                    onClick={usarLocalizacao}
                    className="flex shrink-0 items-center gap-1 rounded-xl bg-violet-100 px-3 text-sm font-semibold text-violet-700"
                  >
                    <MapPin className="h-4 w-4" />
                    GPS
                  </button>
                </div>
              </Campo>

              <Campo label="Status">
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                >
                  {STATUS.map((opcao) => (
                    <option
                      key={opcao.value}
                      value={opcao.value}
                    >
                      {opcao.label}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo label="Observações">
                <textarea
                  value={observacoes}
                  onChange={(event) =>
                    setObservacoes(
                      event.target.value
                    )
                  }
                  rows={3}
                  placeholder="Detalhes importantes do endereço"
                  className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm"
                />
              </Campo>
            </>
          )}
        </div>

        <div className="space-y-2 border-t bg-white px-5 py-4">
          {endereco?.id && (
            <button
              type="button"
              onClick={inativarEndereco}
              disabled={salvando}
              className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-700 disabled:opacity-60"
            >
              Inativar endereço
            </button>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={fechar}
              disabled={salvando}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={salvar}
              disabled={salvando || carregandoOpcoes}
              className="flex-1 rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {salvando
                ? "Salvando..."
                : editando
                  ? "Salvar alterações"
                  : "Cadastrar endereço"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}