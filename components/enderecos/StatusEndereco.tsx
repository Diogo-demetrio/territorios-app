"use client";

import { Copy, MapPinned, MessageCircle, RotateCcw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AppCard } from "@/components/ui/AppCard";

type Status = "visitado" | "nao_atendeu" | "nao_visitado" | "novo";

type Props = {
  endereco: any;
};

const statusConfig = {
  visitado: { label: "Visitado", className: "bg-green-600 text-white ring-2 ring-green-300" },
  nao_atendeu: { label: "Não atendeu", className: "bg-orange-500 text-white ring-2 ring-orange-300" },
  nao_visitado: { label: "Não visitado", className: "bg-red-600 text-white ring-2 ring-red-300" },
  novo: { label: "Novo", className: "bg-blue-600 text-white ring-2 ring-blue-300" },
};

export default function StatusEndereco({ endereco }: Props) {
  const [statusAtual, setStatusAtual] = useState<Status>(
    endereco.status || "nao_visitado"
  );

  const [ultimaVisita, setUltimaVisita] = useState<string | null>(
    endereco.ultima_visita || null
  );

  const mapsUrl =
    endereco.link_google_maps ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${endereco.rua}, ${endereco.numero}, ${endereco.bairro}, ${endereco.cidade}`
    )}`;

  const textoEndereco = `${endereco.rua}, ${endereco.numero}, ${endereco.bairro}, ${endereco.cidade}`;

  const textoMensagem = `📍 ${endereco.rua}, ${endereco.numero}

Bairro: ${endereco.bairro}
Cidade: ${endereco.cidade}
Status: ${statusConfig[statusAtual].label}
${ultimaVisita ? `Última visita: ${new Date(ultimaVisita + "T00:00:00").toLocaleDateString("pt-BR")}` : ""}

${mapsUrl}`;

  async function alterarStatus(status: Status) {
    if (status === statusAtual) return;

    const confirmar = confirm(`Alterar status para "${statusConfig[status].label}"?`);
    if (!confirmar) return;

    const hoje = new Date().toISOString().split("T")[0];

    const dados =
      status === "visitado"
        ? { status, ultima_visita: hoje }
        : { status };

    setStatusAtual(status);
    if (status === "visitado") setUltimaVisita(hoje);

    const { error } = await supabase
      .from("enderecos")
      .update(dados)
      .eq("id", endereco.id);

    if (error) {
      alert("Erro ao salvar status.");
      setStatusAtual(endereco.status || "nao_visitado");
      setUltimaVisita(endereco.ultima_visita || null);
    }
  }

  async function desfazerVisita() {
    if (!confirm("Desfazer visita e limpar a data?")) return;

    setStatusAtual("nao_visitado");
    setUltimaVisita(null);

    await supabase
      .from("enderecos")
      .update({ status: "nao_visitado", ultima_visita: null })
      .eq("id", endereco.id);
  }

  function copiarEndereco() {
    navigator.clipboard.writeText(textoEndereco);
    alert("Endereço copiado!");
  }

  function copiarMensagem() {
    navigator.clipboard.writeText(textoMensagem);
    alert("Mensagem copiada!");
  }

  function abrirMaps() {
    window.open(mapsUrl, "_blank");
  }

  function botaoClasse(status: Status) {
    if (statusAtual === status) return statusConfig[status].className;
    return "bg-white text-gray-700 border border-gray-300";
  }

  return (
  <AppCard>
      <div className="font-semibold">
        {endereco.rua}, {endereco.numero}
      </div>

      <div className="mb-3 text-sm text-gray-500">
        {endereco.bairro} • {endereco.cidade}
      </div>

      <div className="mb-3 text-sm font-semibold">
        Status atual: <StatusBadge status={statusAtual} />
      </div>

      {ultimaVisita && (
        <div className="mb-3 text-sm text-gray-500">
          Última visita: {new Date(ultimaVisita + "T00:00:00").toLocaleDateString("pt-BR")}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => alterarStatus("visitado")} className={`rounded px-3 py-1 text-sm font-semibold ${botaoClasse("visitado")}`}>Visitado</button>
        <button onClick={() => alterarStatus("nao_atendeu")} className={`rounded px-3 py-1 text-sm font-semibold ${botaoClasse("nao_atendeu")}`}>Não atendeu</button>
        <button onClick={() => alterarStatus("nao_visitado")} className={`rounded px-3 py-1 text-sm font-semibold ${botaoClasse("nao_visitado")}`}>Não visitado</button>
        <button onClick={() => alterarStatus("novo")} className={`rounded px-3 py-1 text-sm font-semibold ${botaoClasse("novo")}`}>Novo</button>
      </div>

      {statusAtual === "visitado" && (
        <button onClick={desfazerVisita} className="mb-4 flex items-center gap-2 rounded border border-red-300 px-3 py-2 text-sm text-red-700">
          <RotateCcw size={16} />
          Desfazer visita
        </button>
      )}

      <div className="flex flex-wrap gap-3">
        <button onClick={copiarEndereco} className="flex items-center gap-2 rounded border px-3 py-2">
          <Copy size={18} /> Copiar
        </button>

        <button onClick={copiarMensagem} className="flex items-center gap-2 rounded border px-3 py-2">
          <MessageCircle size={18} /> Copiar mensagem
        </button>

        <button onClick={abrirMaps} className="flex items-center gap-2 rounded border px-3 py-2">
          <MapPinned size={18} /> Maps
        </button>
      </div>
    </AppCard>
  );
}