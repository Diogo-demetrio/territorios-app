"use client";

import {
  STATUS_ENDERECO,
  type StatusEndereco,
} from "@/lib/status";

type Props = {
  statusAtual: StatusEndereco;
  onChange: (status: StatusEndereco) => void;
};

const STATUS_LIST: StatusEndereco[] = [
  "visitado",
  "nao_atendeu",
  "nao_visitado",
  "novo",
];

export default function StatusSelector({
  statusAtual,
  onChange,
}: Props) {
  function botaoClasse(status: StatusEndereco) {
    if (statusAtual === status) {
      return STATUS_ENDERECO[status].active;
    }

    return "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100";
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {STATUS_LIST.map((status) => (
        <button
          key={status}
          onClick={() => onChange(status)}
          className={`rounded-xl px-3 py-3 text-xs font-bold transition ${botaoClasse(status)}`}
        >
          {STATUS_ENDERECO[status].label}
        </button>
      ))}
    </div>
  );
}