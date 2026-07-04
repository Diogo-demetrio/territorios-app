type Props = {
  status?: string;
  count?: number;
};

const config: Record<string, { label: string; dot: string; bg: string }> = {
  visitado: { label: "Visitado", dot: "bg-green-500", bg: "bg-slate-100" },
  nao_visitado: { label: "Não visitado", dot: "bg-red-500", bg: "bg-slate-100" },
  nao_atendeu: { label: "Não atendeu", dot: "bg-orange-500", bg: "bg-slate-100" },
  novo: { label: "Novo", dot: "bg-blue-500", bg: "bg-slate-100" },
};

export function StatusBadge({ status = "nao_visitado", count }: Props) {
  const item = config[status ?? "nao_visitado"] ?? config.nao_visitado;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-slate-700 ${item.bg}`}>
      <span className={`h-2 w-2 rounded-full ${item.dot}`} />
      {typeof count === "number" ? count : item.label}
    </span>
  );
}