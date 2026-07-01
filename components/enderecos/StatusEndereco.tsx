"use client";

import { Copy, MapPinned, RotateCcw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

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
  const [statusAtual, setStatusAtual] = useState<Status>(endereco.status || "nao_visitado");
  const [ultimaVisita, setUltimaVisita] = useState<string | null>(endereco.ultima_visita || null);

  async function alterarStatus(status: Status) {
    const hoje = new Date().toISOString().split("T")[0];

    const dados =
      status === "visitado"
        ? { status, ultima_visita: hoje }
        : { status };

    setStatusAtual(status);
    if (status === "visitado") setUltimaVisita(hoje);

    const { error } = await supabase.from("enderecos").update(dados).eq("id", endereco.id);

    if (error) {
      alert("Erro ao salvar status.");
      setStatusAtual(endereco.status || "nao_visitado");
      setUltimaVisita(endereco.ultima_visita || null);
    }
  }

  async function desfazerVisita() {
    const confirmar = confirm("Desfazer visita e limpar a data?");
    if (!confirmar) return;

    setStatusAtual("nao_visitado");
    setUltimaVisita(null);

    const { error } = await supabase
      .from("enderecos")
      .update({ status: "nao_visitado", ultima_visita: null })
      .eq("id", endereco.id);

    if (error) alert("Erro ao desfazer visita.");
  }

  function copiar() {
    navigator.clipboard.writeText(`${endereco.rua}, ${endereco.numero}, ${endereco.bairro}`);
    alert("Endereço copiado!");
  }

  function abrirMaps() {
    const texto = encodeURIComponent(`${endereco.rua}, ${endereco.numero}, ${endereco.bairro}, ${endereco.cidade}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${texto}`, "_blank");
  }

  function botaoClasse(status: Status) {
    if (statusAtual === status) return statusConfig[status].className;
    return "bg-white text-gray-700 border border-gray-300";
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <div className="font-semibold">{endereco.rua}, {endereco.numero}</div>
      <div className="mb-3 text-sm text-gray-500">{endereco.bairro}</div>

      <div className="mb-3 text-sm font-semibold">
        Status atual:{" "}
        <span className={`rounded-full px-2 py-1 text-xs ${statusConfig[statusAtual].className}`}>
          {statusConfig[statusAtual].label}
        </span>
      </div>

      {ultimaVisita && <div className="mb-3 text-sm text-gray-500">Última visita: {ultimaVisita}</div>}

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

      <div className="flex gap-3">
        <button onClick={copiar} className="flex items-center gap-2 rounded border px-3 py-2"><Copy size={18} />Copiar</button>
        <button onClick={abrirMaps} className="flex items-center gap-2 rounded border px-3 py-2"><MapPinned size={18} />Maps</button>
      </div>
    </div>
  );
}