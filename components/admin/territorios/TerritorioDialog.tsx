"use client";

import { useEffect, useMemo, useState } from "react";
import { Map, X } from "lucide-react";

import { supabase } from "@/lib/supabase";
import type { TerritorioAdmin } from "@/components/admin/territorios/TerritorioCard";

type Congregacao = {
  id: number;
  nome: string;
};

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

type Props = {
  aberto: boolean;
  territorio: TerritorioAdmin | null;
  congregacoes: Congregacao[];
  cidades: Cidade[];
  usuarioCongregacaoId: number | null;
  isSuperAdmin: boolean;
  fechar: () => void;
  aoSalvar: () => Promise<void> | void;
};

export default function TerritorioDialog({
  aberto,
  territorio,
  congregacoes,
  cidades,
  usuarioCongregacaoId,
  isSuperAdmin,
  fechar,
  aoSalvar,
}: Props) {
  const [congregacaoId, setCongregacaoId] = useState("");
  const [cidadeId, setCidadeId] = useState("");
  const [bairroReferencia, setBairroReferencia] = useState("");
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [pontoReferencia, setPontoReferencia] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [carregandoBairros, setCarregandoBairros] =
    useState(false);

  const [calculandoNumero, setCalculandoNumero] =
    useState(false);

  const [salvando, setSalvando] = useState(false);

  const editando = Boolean(territorio);

  const cidadesOrdenadas = useMemo(() => {
    return [...cidades].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR")
    );
  }, [cidades]);

  useEffect(() => {
    if (!aberto) return;

    if (territorio) {
      setCongregacaoId(
        String(territorio.congregacao_id)
      );

      setCidadeId(
        territorio.cidade_id
          ? String(territorio.cidade_id)
          : ""
      );

      setBairroReferencia(
        territorio.bairro_referencia ?? ""
      );

      setNumero(
        territorio.numero !== null
          ? String(territorio.numero)
          : ""
      );

      setNome(territorio.nome ?? "");

      setPontoReferencia(
        territorio.ponto_referencia ?? ""
      );

      setObservacoes(
        territorio.observacoes ?? ""
      );

      setAtivo(territorio.ativo);
    } else {
      setCongregacaoId(
        isSuperAdmin
          ? ""
          : usuarioCongregacaoId
            ? String(usuarioCongregacaoId)
            : ""
      );

      setCidadeId("");
      setBairroReferencia("");
      setNumero("");
      setNome("");
      setPontoReferencia("");
      setObservacoes("");
      setAtivo(true);
      setBairros([]);
    }
  }, [
    aberto,
    territorio,
    isSuperAdmin,
    usuarioCongregacaoId,
  ]);

  useEffect(() => {
    if (!aberto || !cidadeId) {
      setBairros([]);
      return;
    }

    carregarBairros(Number(cidadeId));
  }, [aberto, cidadeId]);

  async function carregarBairros(idCidade: number) {
    setCarregandoBairros(true);

    const { data, error } = await supabase
      .from("bairros")
      .select("id, cidade_id, nome, ativo")
      .eq("cidade_id", idCidade)
      .eq("ativo", true)
      .order("nome");

    setCarregandoBairros(false);

    if (error) {
      console.error(error);
      alert("Não foi possível carregar os bairros.");
      return;
    }

    setBairros((data ?? []) as Bairro[]);
  }

  async function calcularMenorNumeroDisponivel(
    congregacaoSelecionada: number,
    cidadeSelecionada: number,
    bairroSelecionado: string
  ) {
    setCalculandoNumero(true);

    let consulta = supabase
      .from("territorios")
      .select("id, numero")
      .eq(
        "congregacao_id",
        congregacaoSelecionada
      )
      .eq("cidade_id", cidadeSelecionada)
      .eq("bairro", bairroSelecionado)
      .not("numero", "is", null)
      .order("numero");

    if (territorio?.id) {
      consulta = consulta.neq(
        "id",
        territorio.id
      );
    }

    const { data, error } = await consulta;

    setCalculandoNumero(false);

    if (error) {
      console.error(error);
      alert(
        "Não foi possível calcular o número do território."
      );
      return null;
    }

    const numerosUsados = new Set(
      (data ?? [])
        .map((item) => Number(item.numero))
        .filter(
          (valor) =>
            Number.isInteger(valor) && valor > 0
        )
    );

    let candidato = 1;

    while (numerosUsados.has(candidato)) {
      candidato += 1;
    }

    return candidato;
  }

  async function selecionarBairro(valor: string) {
    setBairroReferencia(valor);

    if (
      editando ||
      !valor ||
      !congregacaoId ||
      !cidadeId
    ) {
      return;
    }

    const proximoNumero =
      await calcularMenorNumeroDisponivel(
        Number(congregacaoId),
        Number(cidadeId),
        valor
      );

    if (proximoNumero === null) return;

    setNumero(String(proximoNumero));
    setNome(`${valor} ${proximoNumero}`);
  }

  async function salvar() {
    const nomeLimpo = nome
      .trim()
      .replace(/\s+/g, " ");

    const bairroLimpo = bairroReferencia
      .trim()
      .replace(/\s+/g, " ");

    const numeroConvertido = Number(numero);

    if (!congregacaoId) {
      alert("Selecione a congregação.");
      return;
    }

    if (!cidadeId) {
      alert("Selecione a cidade.");
      return;
    }

    if (!bairroLimpo) {
      alert("Selecione o bairro de referência.");
      return;
    }

    if (
      !Number.isInteger(numeroConvertido) ||
      numeroConvertido < 1
    ) {
      alert("Informe um número válido.");
      return;
    }

    if (!nomeLimpo) {
      alert("Informe o nome do território.");
      return;
    }

    setSalvando(true);

    try {
      let consultaNumero = supabase
        .from("territorios")
        .select("id, nome")
        .eq(
          "congregacao_id",
          Number(congregacaoId)
        )
        .eq("cidade_id", Number(cidadeId))
        .eq("bairro", bairroLimpo)
        .eq("numero", numeroConvertido);

      if (territorio?.id) {
        consultaNumero = consultaNumero.neq(
          "id",
          territorio.id
        );
      }

      const {
        data: numeroDuplicado,
        error: erroNumero,
      } = await consultaNumero.limit(1);

      if (erroNumero) {
        console.error(erroNumero);
        alert("Não foi possível validar o número.");
        return;
      }

      if (
        numeroDuplicado &&
        numeroDuplicado.length > 0
      ) {
        alert(
          `O número ${numeroConvertido} já está sendo usado para "${bairroLimpo}" nesta congregação.`
        );
        return;
      }

      const cidadeSelecionada = cidades.find(
        (cidade) =>
          cidade.id === Number(cidadeId)
      );

      const dados = {
        congregacao_id: Number(congregacaoId),
        cidade_id: Number(cidadeId),
        cidade: cidadeSelecionada?.nome ?? null,
        bairro: bairroLimpo,
        numero: numeroConvertido,
        nome: nomeLimpo,
        ponto_referencia:
          pontoReferencia.trim() || null,
        observacoes:
          observacoes.trim() || null,
        ativo,
      };

      if (editando && territorio) {
  if (territorio.ativo && !ativo) {
    const statusDesignacao =
      territorio.status_designacao
        ?.trim()
        .toLowerCase();

    const territorioEmUso =
      Boolean(statusDesignacao) &&
      !["disponivel", "devolvido", "livre"].includes(
        statusDesignacao!
      );

    if (territorioEmUso) {
      alert(
        `O território "${territorio.nome}" está designado.\n\n` +
          "Registre a devolução antes de desativá-lo."
      );
      return;
    }

    const confirmar = confirm(
      `Desativar o território "${territorio.nome}"?\n\n` +
        "Ele permanecerá salvo e poderá ser reativado depois. " +
        "Os endereços não serão apagados."
    );

    if (!confirmar) {
      return;
    }
  }

  const { error } = await supabase
    .from("territorios")
    .update(dados)
    .eq("id", territorio.id);

  if (error) {
    console.error(error);

    alert(
      `Erro ao editar território: ${error.message}`
    );

    return;
  }
} else {
  const { error } = await supabase
    .from("territorios")
    .insert({
      ...dados,
      status_designacao: "disponivel",
    });

  if (error) {
    console.error(error);

    alert(
      `Erro ao criar território: ${error.message}`
    );

    return;
  }
}

await aoSalvar();
fechar();

      await aoSalvar();
      fechar();
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
              <Map className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editando
                  ? "Editar território"
                  : "Novo território"}
              </h2>

              <p className="text-sm text-slate-500">
                Defina os dados administrativos.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fechar}
            disabled={salvando}
            className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <Campo label="Congregação">
            <select
              value={congregacaoId}
              onChange={(event) => {
                setCongregacaoId(
                  event.target.value
                );

                if (!editando) {
                  setNumero("");
                  setNome("");
                }
              }}
              disabled={!isSuperAdmin}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm disabled:bg-slate-100"
            >
              <option value="">Selecione</option>

              {congregacoes.map((congregacao) => (
                <option
                  key={congregacao.id}
                  value={congregacao.id}
                >
                  {congregacao.nome}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Cidade">
            <select
              value={cidadeId}
              onChange={(event) => {
                setCidadeId(event.target.value);
                setBairroReferencia("");

                if (!editando) {
                  setNumero("");
                  setNome("");
                }
              }}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            >
              <option value="">Selecione</option>

              {cidadesOrdenadas.map((cidade) => (
                <option
                  key={cidade.id}
                  value={cidade.id}
                >
                  {cidade.nome}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Bairro de referência">
            <select
              value={bairroReferencia}
              onChange={(event) =>
                selecionarBairro(
                  event.target.value
                )
              }
              disabled={
                !cidadeId || carregandoBairros
              }
              className="w-full rounded-xl border border-slate-200 p-3 text-sm disabled:bg-slate-100"
            >
              <option value="">
                {carregandoBairros
                  ? "Carregando..."
                  : "Selecione"}
              </option>

              {bairros.map((bairro) => (
                <option
                  key={bairro.id}
                  value={bairro.nome}
                >
                  {bairro.nome}
                </option>
              ))}

              {bairroReferencia &&
                !bairros.some(
                  (bairro) =>
                    bairro.nome ===
                    bairroReferencia
                ) && (
                  <option
                    value={bairroReferencia}
                  >
                    {bairroReferencia}
                  </option>
                )}
            </select>
          </Campo>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Número
              </label>

              <input
                type="number"
                min="1"
                value={numero}
                onChange={(event) => {
  const valor = event.target.value;
  setNumero(valor);

  if (bairroReferencia && valor) {
    setNome(`${bairroReferencia} ${valor}`);
  } else {
    setNome("");
  }
}}
                disabled={calculandoNumero}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm disabled:bg-slate-100"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Nome
              </label>

              <input
  value={nome}
  readOnly
  className="w-full rounded-xl border border-slate-200 bg-slate-100 p-3 text-sm text-slate-700"
/>
            </div>
          </div>

          <Campo label="Ponto de referência">
            <input
              value={pontoReferencia}
              onChange={(event) =>
                setPontoReferencia(
                  event.target.value
                )
              }
              placeholder="Opcional"
              className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            />
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
              placeholder="Opcional"
              className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm"
            />
          </Campo>

          {editando && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Território ativo
                  </p>

                  <p className="text-xs text-slate-500">
                    Desativar não apaga os endereços.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setAtivo((valor) => !valor)
                  }
                  className={`relative h-7 w-12 rounded-full transition ${
                    ativo
                      ? "bg-green-600"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                      ativo
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-2">
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
            disabled={
              salvando || calculandoNumero
            }
            className="flex-1 rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {salvando
              ? "Salvando..."
              : "Salvar"}
          </button>
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
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      {children}
    </div>
  );
}