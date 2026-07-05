"use client";

import {
  Copy,
  MapPinned,
  MessageCircle,
  RotateCcw,
  Calendar,
  Home,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Status = "visitado" | "nao_atendeu" | "nao_visitado" | "novo";

type Props = {
  endereco: any;
};

const statusConfig = {
  visitado: {
    label: "Visitado",
    active: "bg-green-600 text-white ring-2 ring-green-200",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  nao_atendeu: {
    label: "Não atendeu",
    active: "bg-orange-500 text-white ring-2 ring-orange-200",
    badge: "bg-orange-100 text-orange-700",
    dot: "bg-orange-500",
  },
  nao_visitado: {
    label: "Não visitado",
    active: "bg-red-500 text-white ring-2 ring-red-200",
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
  novo: {
    label: "Novo",
    active: "bg-blue-600 text-white ring-2 ring-blue-200",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
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
    if (statusAtual === status) return statusConfig[status].active;
    return "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100";
  }

  const statusInfo = statusConfig[statusAtual];

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
            <Home className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-900">
              {endereco.rua}, {endereco.numero}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {endereco.bairro} • {endereco.cidade}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusInfo.badge}`}
        >
          <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
          {statusInfo.label}
        </span>
      </div>

      {ultimaVisita && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
          <Calendar className="h-4 w-4" />
          Última visita:{" "}
          {new Date(ultimaVisita + "T00:00:00").toLocaleDateString("pt-BR")}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => alterarStatus("visitado")}
          className={`rounded-xl px-3 py-3 text-xs font-bold transition ${botaoClasse("visitado")}`}
        >
          Visitado
        </button>

        <button
          onClick={() => alterarStatus("nao_atendeu")}
          className={`rounded-xl px-3 py-3 text-xs font-bold transition ${botaoClasse("nao_atendeu")}`}
        >
          Não atendeu
        </button>

        <button
          onClick={() => alterarStatus("nao_visitado")}
          className={`rounded-xl px-3 py-3 text-xs font-bold transition ${botaoClasse("nao_visitado")}`}
        >
          Não visitado
        </button>

        <button
          onClick={() => alterarStatus("novo")}
          className={`rounded-xl px-3 py-3 text-xs font-bold transition ${botaoClasse("novo")}`}
        >
          Novo
        </button>
      </div>

      {statusAtual === "visitado" && (
        <button
          onClick={desfazerVisita}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
        >
          <RotateCcw size={16} />
          Desfazer visita
        </button>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={abrirMaps}
          className="flex flex-col items-center justify-center gap-1 rounded-xl border border-violet-200 bg-white px-2 py-3 text-xs font-semibold text-violet-700 hover:bg-violet-50"
        >
          <MapPinned size={18} />
          Maps
        </button>

        <button
          onClick={copiarEndereco}
          className="flex flex-col items-center justify-center gap-1 rounded-xl border border-violet-200 bg-white px-2 py-3 text-xs font-semibold text-violet-700 hover:bg-violet-50"
        >
          <Copy size={18} />
          Copiar
        </button>

        <button
          onClick={copiarMensagem}
          className="flex flex-col items-center justify-center gap-1 rounded-xl border border-violet-200 bg-violet-50 px-2 py-3 text-xs font-semibold text-violet-700 hover:bg-violet-100"
        >
          <MessageCircle size={18} />
          Mensagem
        </button>
      </div>
    </div>
  );
}