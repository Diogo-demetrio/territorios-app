"use client";

import { useEffect, useState } from "react";
import { MapPinned, X } from "lucide-react";

import { supabase } from "@/lib/supabase";

export type BairroAdmin = {
  id: number;
  congregacao_id: number | null;
  cidade_id: number;
  nome: string;
  ativo: boolean;
};

export type CidadeBairroAdmin = {
  id: number;
  congregacao_id: number;
  nome: string;
  ativo: boolean;
};

type Props = {
  aberto: boolean;
  cidadeId?: number;
  cidadeNome?: string;
  congregacaoId?: number | null;
  cidades?: CidadeBairroAdmin[];
  bairro: BairroAdmin | null;
  fechar: () => void;
  aoSalvar: () => Promise<void> | void;
};

export default function BairroDialog({
  aberto,
  cidadeId,
  cidadeNome,
  congregacaoId,
  cidades,
  bairro,
  fechar,
  aoSalvar,
}: Props) {
  const [nome, setNome] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [cidadeSelecionadaId, setCidadeSelecionadaId] = useState("");
  const [salvando, setSalvando] = useState(false);

  const editando = Boolean(bairro);
  const permiteEscolherCidade = Boolean(cidades?.length);

  useEffect(() => {
    if (!aberto) return;

    setNome(bairro?.nome ?? "");
    setAtivo(bairro?.ativo ?? true);
    setCidadeSelecionadaId(
      String(
        bairro?.cidade_id ??
          cidadeId ??
          cidades?.find((cidade) => cidade.ativo)?.id ??
          ""
      )
    );
  }, [aberto, bairro, cidadeId, cidades]);

  if (!aberto) return null;

  async function salvar() {
    const nomeLimpo = nome.trim().replace(/\s+/g, " ");
    const idCidade = Number(cidadeSelecionadaId || cidadeId);
    const cidadeSelecionada = cidades?.find(
      (cidade) => cidade.id === idCidade
    );
    const idCongregacao =
      cidadeSelecionada?.congregacao_id ?? congregacaoId;
    const nomeCidade = cidadeSelecionada?.nome ?? cidadeNome ?? "";

    if (!nomeLimpo) {
      alert("Informe o nome do bairro.");
      return;
    }

    if (!Number.isInteger(idCidade) || !idCongregacao) {
      alert("Selecione uma cidade válida.");
      return;
    }

    setSalvando(true);

    try {
      let consultaDuplicado = supabase
        .from("bairros")
        .select("id, nome")
        .eq("cidade_id", idCidade)
        .ilike("nome", nomeLimpo);

      if (bairro?.id) {
        consultaDuplicado = consultaDuplicado.neq("id", bairro.id);
      }

      const { data: duplicados, error: erroDuplicado } =
        await consultaDuplicado.limit(1);

      if (erroDuplicado) {
        console.error(erroDuplicado);
        alert("Não foi possível validar o nome do bairro.");
        return;
      }

      if (duplicados && duplicados.length > 0) {
        alert(
          `Já existe um bairro chamado "${nomeLimpo}" em ${nomeCidade}.`
        );
        return;
      }

      if (editando && bairro) {
        if (bairro.ativo && !ativo) {
          const confirmar = confirm(
            `Inativar o bairro "${bairro.nome}"?\n\n` +
              "Ele permanecerá salvo e poderá ser reativado depois."
          );

          if (!confirmar) return;
        }

        const { data, error } = await supabase
          .from("bairros")
          .update({
            congregacao_id: idCongregacao,
            cidade_id: idCidade,
            nome: nomeLimpo,
            ativo,
          })
          .eq("id", bairro.id)
          .eq("cidade_id", bairro.cidade_id)
          .select("id")
          .maybeSingle();

        if (error || !data) {
          console.error(error);
          alert(
            error
              ? `Erro ao editar bairro: ${error.message}`
              : "O bairro não foi alterado. Verifique sua permissão."
          );
          return;
        }
      } else {
        const { data, error } = await supabase
          .from("bairros")
          .insert({
            congregacao_id: idCongregacao,
            cidade_id: idCidade,
            nome: nomeLimpo,
            ativo: true,
          })
          .select("id")
          .maybeSingle();

        if (error || !data) {
          console.error(error);
          alert(
            error
              ? `Erro ao criar bairro: ${error.message}`
              : "O bairro não foi criado. Verifique sua permissão."
          );
          return;
        }
      }

      await aoSalvar();
      fechar();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0B2B20]/45 px-4 py-6 [font-family:var(--font-geist-sans),Arial,sans-serif]">
      <div className="max-h-full w-full max-w-md overflow-y-auto rounded-[24px] border border-[#DDE2DB] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#DCE8D5] text-[#123D2C]">
              <MapPinned className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#17211C]">
                {editando ? "Editar bairro" : "Novo bairro"}
              </h2>
              {!permiteEscolherCidade && (
                <p className="text-sm text-[#6F7872]">
                  Cidade: {cidadeNome}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={fechar}
            disabled={salvando}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#6F7872] transition hover:bg-[#F4F5F0]"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {permiteEscolherCidade && (
          <label className="mb-4 block text-sm font-semibold text-[#17211C]">
            Cidade
            <select
              value={cidadeSelecionadaId}
              onChange={(event) => setCidadeSelecionadaId(event.target.value)}
              disabled={salvando}
              className="mt-1 h-12 w-full rounded-xl border border-[#DDE2DB] bg-white px-3 text-sm font-normal text-[#17211C] outline-none transition focus:border-[#2F6B4F] focus:ring-2 focus:ring-[#DCE8D5]"
            >
              <option value="">Selecione uma cidade</option>
              {cidades?.map((cidade) => (
                <option
                  key={cidade.id}
                  value={cidade.id}
                  disabled={!cidade.ativo && cidade.id !== bairro?.cidade_id}
                >
                  {cidade.nome}{cidade.ativo ? "" : " (inativa)"}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="mb-1 block text-sm font-semibold text-[#17211C]">
          Nome do bairro
        </label>
        <input
          autoFocus={!permiteEscolherCidade}
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !salvando) salvar();
          }}
          placeholder="Ex.: Centro"
          className="h-12 w-full rounded-xl border border-[#DDE2DB] bg-white px-3 text-sm text-[#17211C] outline-none transition focus:border-[#2F6B4F] focus:ring-2 focus:ring-[#DCE8D5]"
        />

        {editando && (
          <div className="mt-4 rounded-[16px] border border-[#DDE2DB] bg-[#F4F5F0] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#17211C]">
                  Bairro ativo
                </p>
                <p className="text-xs text-[#6F7872]">
                  Ao inativar, ele permanece salvo no banco.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAtivo((valor) => !valor)}
                className={`relative h-7 w-12 rounded-full transition ${
                  ativo ? "bg-[#2F6B4F]" : "bg-[#C9D0C9]"
                }`}
                aria-label={ativo ? "Inativar bairro" : "Reativar bairro"}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    ativo ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={fechar}
            disabled={salvando}
            className="min-h-12 flex-1 rounded-[14px] border border-[#DDE2DB] bg-white py-3 text-sm font-semibold text-[#17211C] transition hover:bg-[#F4F5F0] disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="min-h-12 flex-1 rounded-[14px] bg-[#123D2C] py-3 text-sm font-semibold text-white transition hover:bg-[#0B2B20] disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
