type Status = "visitado" | "nao_atendeu" | "nao_visitado" | "novo";

type Props = {
  status?: Status | string | null;
};

const statusConfig = {
  visitado: {
    label: "Visitado",
    className: "bg-green-600 text-white",
  },
  nao_atendeu: {
    label: "Não atendeu",
    className: "bg-orange-500 text-white",
  },
  nao_visitado: {
    label: "Não visitado",
    className: "bg-red-600 text-white",
  },
  novo: {
    label: "Novo",
    className: "bg-blue-600 text-white",
  },
};

export function StatusBadge({ status }: Props) {
  const statusSeguro = (status || "nao_visitado") as Status;
  const config = statusConfig[statusSeguro] ?? statusConfig.nao_visitado;

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}