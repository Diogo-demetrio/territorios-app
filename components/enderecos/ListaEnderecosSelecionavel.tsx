"use client";

import { Check, CheckSquare, Copy, Send, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import StatusEndereco from "@/components/enderecos/StatusEndereco";
import { montarMensagemEnderecos } from "@/lib/endereco";
import { dataAtualSaoPaulo } from "@/lib/status";

type Status = "visitado" | "nao_atendeu" | "nao_visitado" | "novo";

type Props = {
  enderecos: any[];
  territorio: any;
  congregacao: any;
};

export default function ListaEnderecosSelecionavel({
  enderecos,
  territorio,
  congregacao,
}: Props) {
  const [modoSelecao, setModoSelecao] = useState(false);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const { isSuporte } = useAuth();

  const listaSelecionada = enderecos.filter((e) => selecionados.includes(e.id));

  function toggleSelecionado(id: number) {
    setSelecionados((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]
    );
  }

  function cancelarSelecao() {
    setModoSelecao(false);
    setSelecionados([]);
  }

  async function copiarSelecionados() {
    if (listaSelecionada.length === 0) {
      alert("Selecione pelo menos um endereço.");
      return;
    }

    await navigator.clipboard.writeText(
      montarMensagemEnderecos({
        enderecos: listaSelecionada,
        territorio,
        congregacao,
      })
    );

    alert("Endereços copiados.");
  }

  async function encaminharSelecionados() {
    if (listaSelecionada.length === 0) {
      alert("Selecione pelo menos um endereço.");
      return;
    }

    await navigator.clipboard.writeText(
      montarMensagemEnderecos({
        enderecos: listaSelecionada,
        territorio,
        congregacao,
      })
    );

    alert("Mensagem copiada. Agora é só colar no WhatsApp.");
  }

  async function alterarStatusLote(status: Status) {
    if (!isSuporte) {
      alert("Você precisa entrar como suporte ou administrador.");
      return;
    }

    if (selecionados.length === 0) {
      alert("Selecione pelo menos um endereço.");
      return;
    }

    const confirmar = confirm(
      `Alterar ${selecionados.length} endereço(s) selecionado(s)?`
    );

    if (!confirmar) return;

    const hoje = dataAtualSaoPaulo();

    const dados =
      status === "visitado" ? { status, ultima_visita: hoje } : { status };

    const { error } = await supabase
      .from("enderecos")
      .update(dados)
      .in("id", selecionados);

    if (error) {
      alert("Erro ao alterar status em lote.");
      return;
    }

    location.reload();
  }

  return (
    <div>
      <div className="mb-4">
        {!modoSelecao ? (
          <button
            onClick={() => setModoSelecao(true)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-[#DDE2DB] bg-white px-4 py-2.5 text-sm font-semibold text-[#123D2C] shadow-[0_3px_12px_rgba(18,61,44,0.035)] transition hover:border-[#8FAF72]/60 hover:bg-[#F9FBF7] active:scale-[0.99]"
          >
            <CheckSquare className="h-4 w-4" />
            Selecionar endereços
          </button>
        ) : (
          <div className="space-y-3 rounded-[18px] border border-[#8FAF72]/60 bg-[#F9FBF7] p-3.5 shadow-[0_4px_16px_rgba(18,61,44,0.05)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#123D2C]">
                {selecionados.length} selecionado(s)
              </span>

              <button
                onClick={cancelarSelecao}
                className="flex min-h-10 items-center gap-1 rounded-xl border border-[#DDE2DB] bg-white px-3 py-2 text-xs font-semibold text-[#6F7872]"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={encaminharSelecionados}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2F6B4F] py-2 text-sm font-semibold text-white transition hover:bg-[#123D2C]"
              >
                <Send className="h-4 w-4" />
                WhatsApp
              </button>

              <button
                onClick={copiarSelecionados}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DDE2DB] bg-white py-2 text-sm font-semibold text-[#123D2C]"
              >
                <Copy className="h-4 w-4" />
                Copiar
              </button>
            </div>

            {isSuporte && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => alterarStatusLote("visitado")}
                  className="rounded-xl bg-green-50 py-2 text-xs font-bold text-green-700"
                >
                  Marcar visitado
                </button>

                <button
                  onClick={() => alterarStatusLote("nao_atendeu")}
                  className="rounded-xl bg-orange-50 py-2 text-xs font-bold text-orange-700"
                >
                  Não atendeu
                </button>

                <button
                  onClick={() => alterarStatusLote("nao_visitado")}
                  className="rounded-xl bg-red-50 py-2 text-xs font-bold text-red-700"
                >
                  Não visitado
                </button>

                <button
                  onClick={() => alterarStatusLote("novo")}
                  className="rounded-xl bg-blue-50 py-2 text-xs font-bold text-blue-700"
                >
                  Novo
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {enderecos.map((endereco) => {
          const selecionado = selecionados.includes(endereco.id);

          return (
            <div
              key={endereco.id}
              className={`relative rounded-[20px] transition-all ${
                selecionado
                  ? "ring-2 ring-[#2F6B4F] ring-offset-2 ring-offset-[#F4F5F0]"
                  : ""
              }`}
            >
              {modoSelecao && (
                <button
                  type="button"
                  onClick={() => toggleSelecionado(endereco.id)}
                  className={`absolute right-4 top-14 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition ${
                    selecionado
                      ? "border-[#123D2C] bg-[#123D2C] text-white"
                      : "border-[#DDE2DB] bg-white text-transparent"
                  }`}
                >
                  <Check className="h-4 w-4" />
                </button>
              )}

              <StatusEndereco endereco={endereco} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
