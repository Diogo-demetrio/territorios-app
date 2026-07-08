"use client";

import { Check, CheckSquare, Copy, Send, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import StatusEndereco from "@/components/enderecos/StatusEndereco";
import { montarMensagemEnderecos } from "@/lib/endereco";

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

    const hoje = new Date().toISOString().split("T")[0];

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
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 py-2 text-sm font-semibold text-violet-700"
          >
            <CheckSquare className="h-4 w-4" />
            Selecionar endereços
          </button>
        ) : (
          <div className="space-y-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                {selecionados.length} selecionado(s)
              </span>

              <button
                onClick={cancelarSelecao}
                className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={encaminharSelecionados}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-2 text-sm font-semibold text-white"
              >
                <Send className="h-4 w-4" />
                WhatsApp
              </button>

              <button
                onClick={copiarSelecionados}
                className="flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 py-2 text-sm font-semibold text-violet-700"
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
              className={`relative rounded-3xl transition-all ${
                selecionado ? "ring-2 ring-violet-600" : ""
              }`}
            >
              {modoSelecao && (
                <button
                  type="button"
                  onClick={() => toggleSelecionado(endereco.id)}
                  className={`absolute right-4 top-14 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition ${
                    selecionado
                      ? "border-violet-700 bg-violet-700 text-white"
                      : "border-slate-300 bg-white text-transparent"
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