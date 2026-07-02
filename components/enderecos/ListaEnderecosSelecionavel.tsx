"use client";

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
      atual.includes(id)
        ? atual.filter((item) => item !== id)
        : [...atual, id]
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
      <div className="mb-4 flex gap-2">
        {!modoSelecao ? (
          <button
            onClick={() => setModoSelecao(true)}
            className="rounded-lg bg-[#5E3C8A] px-4 py-2 text-sm font-semibold text-white"
          >
            Selecionar endereços
          </button>
        ) : (
          <>
            <button
              onClick={encaminharSelecionados}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Encaminhar ({selecionados.length})
            </button>

            <button
              onClick={cancelarSelecao}
              className="rounded-lg border px-4 py-2 text-sm font-semibold"
            >
              Cancelar
            </button>
          </>
        )}
      </div>

      <div className="space-y-3">
        {enderecos.map((endereco) => (
          <div key={endereco.id} className="relative">
            {modoSelecao && (
              <label className="mb-2 flex items-center gap-2 rounded-lg bg-white p-3 shadow">
                <input
                  type="checkbox"
                  checked={selecionados.includes(endereco.id)}
                  onChange={() => toggleSelecionado(endereco.id)}
                  className="h-5 w-5"
                />
                <span className="font-semibold">
                  {endereco.rua}, {endereco.numero}
                </span>
              </label>
            )}

            {!modoSelecao && <StatusEndereco endereco={endereco} />}
          </div>
        ))}
      </div>
    </div>
  );
}