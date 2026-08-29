export type StatusEndereco = "visitado" | "nao_atendeu" | "nao_visitado" | "novo";

export const STATUS_ENDERECO = {
  visitado: {
    label: "Visitado",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-500",
    active: "bg-green-600 text-white ring-2 ring-green-200",
    pin: "#16a34a",
  },
  nao_atendeu: {
    label: "Não atendeu",
    badge: "bg-orange-100 text-orange-700",
    dot: "bg-orange-500",
    active: "bg-orange-500 text-white ring-2 ring-orange-200",
    pin: "#f97316",
  },
  nao_visitado: {
    label: "Não visitado",
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
    active: "bg-red-500 text-white ring-2 ring-red-200",
    pin: "#dc2626",
  },
  novo: {
    label: "Novo",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    active: "bg-blue-600 text-white ring-2 ring-blue-200",
    pin: "#2563eb",
  },
} as const;

export function normalizarStatus(status?: string | null): StatusEndereco {
  if (
    status === "visitado" ||
    status === "nao_atendeu" ||
    status === "nao_visitado" ||
    status === "novo"
  ) {
    return status;
  }

  return "nao_visitado";
}

export function dataAtualSaoPaulo() {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";

  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}
