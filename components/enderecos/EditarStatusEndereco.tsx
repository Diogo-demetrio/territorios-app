"use client";

import { useState } from "react";
import { RefreshCw, X } from "lucide-react";

import StatusSelector from "@/components/status/StatusSelector";
import { supabase } from "@/lib/supabase";
import {
  dataAtualSaoPaulo,
  normalizarStatus,
  type StatusEndereco,
} from "@/lib/status";

type Props = {
  endereco: {
    id: number;
    rua?: string | null;
    numero?: string | null;
    status?: string | null;
  };
};

export default function EditarStatusEndereco({ endereco }: Props) {
  const statusOriginal = normalizarStatus(endereco.status);
  const [aberto, setAberto] = useState(false);
  const [status, setStatus] = useState<StatusEndereco>(statusOriginal);
  const [salvando, setSalvando] = useState(false);

  function fechar() {
    if (salvando) return;
    setStatus(statusOriginal);
    setAberto(false);
  }

  async function salvar() {
    if (status === statusOriginal) {
      fechar();
      return;
    }

    setSalvando(true);

    const alteracoes: {
      status: StatusEndereco;
      ultima_visita?: string;
    } = { status };

    if (status === "visitado" && statusOriginal !== "visitado") {
      alteracoes.ultima_visita = dataAtualSaoPaulo();
    }

    const { data, error } = await supabase
      .from("enderecos")
      .update(alteracoes)
      .eq("id", endereco.id)
      .select("id, status")
      .maybeSingle();

    setSalvando(false);

    if (error || !data) {
      console.error(error);
      alert(error?.message || "Não foi possível alterar o status.");
      return;
    }

    window.location.reload();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#8FAF72]/60 bg-[#DCE8D5]/60 px-4 py-2.5 text-sm font-semibold text-[#123D2C] transition hover:bg-[#DCE8D5]"
      >
        <RefreshCw className="h-4 w-4" />
        Alterar status
      </button>

      {aberto && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`titulo-status-${endereco.id}`}
            className="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 bg-[#123D2C] px-5 py-4 text-white">
              <div>
                <p className="text-xs font-medium text-white/75">Alterar status</p>
                <h2 id={`titulo-status-${endereco.id}`} className="mt-1 text-lg font-semibold">
                  {endereco.rua || "Endereço"}, {endereco.numero || "S/N"}
                </h2>
              </div>

              <button
                type="button"
                onClick={fechar}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white transition hover:bg-white/10"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <p className="mb-3 text-sm font-semibold text-[#36453D]">Novo status</p>
              <StatusSelector statusAtual={status} onChange={setStatus} />

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={fechar}
                  disabled={salvando}
                  className="flex-1 rounded-xl border border-[#DDE2DB] py-3 text-sm font-semibold text-[#4E5B54] transition hover:bg-[#F4F5F0] disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={salvar}
                  disabled={salvando || status === statusOriginal}
                  className="flex-1 rounded-xl bg-[#123D2C] py-3 text-sm font-semibold text-white transition hover:bg-[#0B2B20] disabled:opacity-60"
                >
                  {salvando ? "Salvando..." : "Salvar status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
