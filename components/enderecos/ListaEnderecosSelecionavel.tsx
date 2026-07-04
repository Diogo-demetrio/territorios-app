"use client";

import { Send, CheckSquare, Check } from "lucide-react";
import { useState } from "react";
import StatusEndereco from "@/components/enderecos/StatusEndereco";

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

  function toggleSelecionado(id: number) {
    setSelecionados((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]
    );
  }

  function cancelarSelecao() {
    setModoSelecao(false);
    setSelecionados([]);
  }

  async function encaminharSelecionados() {
    const lista = enderecos.filter((e) => selecionados.includes(e.id));

    if (lista.length === 0) {
      alert("Selecione pelo menos um endereço.");
      return;
    }

    const mensagem = `📍 ${congregacao?.nome ?? "Congregação"}

🗂 Território: ${territorio.nome}
📌 ${territorio.bairro} • ${territorio.cidade}

━━━━━━━━━━━━━━

${lista
  .map((endereco, index) => {
    const mapsUrl =
      endereco.link_google_maps ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${endereco.rua}, ${endereco.numero}, ${endereco.bairro}, ${endereco.cidade}`
      )}`;

    return `${index + 1}) ${endereco.rua}, ${endereco.numero}

Bairro: ${endereco.bairro}
Cidade: ${endereco.cidade}
Direção nº: ${index + 1}
Status: ${endereco.status ?? "nao_visitado"}

${mapsUrl}`;
  })
  .join("\n\n━━━━━━━━━━━━━━\n\n")}`;

    await navigator.clipboard.writeText(mensagem);
    alert("Mensagem copiada. Agora é só colar no WhatsApp.");
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
          <div className="flex gap-2">
            <button
              onClick={encaminharSelecionados}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-2 text-sm font-semibold text-white"
            >
              <Send className="h-4 w-4" />
{selecionados.length > 0
  ? `Encaminhar (${selecionados.length})`
  : "Encaminhar"}
            </button>

            <button
  onClick={cancelarSelecao}
  className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-slate-700"
>
  Cancelar
</button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {enderecos.map((endereco) => {
          const selecionado = selecionados.includes(endereco.id);

          return (
            <div
              key={endereco.id}
              className={`relative rounded-2xl transition-all ${
                selecionado ? "ring-2 ring-violet-600" : ""
              }`}
            >
              {modoSelecao && (
               <button
  type="button"
  onClick={() => toggleSelecionado(endereco.id)}
  className={`absolute right-4 top-4 z-20 flex h-7 w-7 items-center justify-center rounded-full border transition ${
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