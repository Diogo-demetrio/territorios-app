"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

type Status = "visitado" | "nao_visitado" | "nao_atendeu" | "novo";

type Props = {
  enderecoId: number;
  statusAtual: Status;
};

const statusConfig = {
  visitado: {
    label: "Visitado",
    className: "bg-green-600 text-white",
  },
  nao_visitado: {
    label: "Não visitado",
    className: "bg-red-600 text-white",
  },
  nao_atendeu: {
    label: "Não atendeu",
    className: "bg-orange-500 text-white",
  },
  novo: {
    label: "Novo cadastro",
    className: "bg-blue-600 text-white",
  },
};

export function StatusEndereco({ enderecoId, statusAtual }: Props) {
  const [status, setStatus] = useState<Status>(statusAtual || "nao_visitado");

  async function alterarStatus(novoStatus: Status) {
    setStatus(novoStatus);

    await supabase
      .from("enderecos")
      .update({ status: novoStatus })
      .eq("id", enderecoId);
  }

  return (
    <div className="mt-3">
      <div
        className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusConfig[status].className}`}
      >
        {statusConfig[status].label}
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => alterarStatus("visitado")} className="rounded bg-green-600 px-3 py-2 text-xs font-semibold text-white">
          Visitado
        </button>

        <button onClick={() => alterarStatus("nao_visitado")} className="rounded bg-red-600 px-3 py-2 text-xs font-semibold text-white">
          Não visitado
        </button>

        <button onClick={() => alterarStatus("nao_atendeu")} className="rounded bg-orange-500 px-3 py-2 text-xs font-semibold text-white">
          Não atendeu
        </button>

        <button onClick={() => alterarStatus("novo")} className="rounded bg-blue-600 px-3 py-2 text-xs font-semibold text-white">
          Novo
        </button>
      </div>
    </div>
  );
}