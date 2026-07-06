import { normalizarStatus } from "@/lib/status";

export function calcularTotaisEnderecos(enderecos: any[]) {
  return {
    total: enderecos.length,
    visitado: enderecos.filter((e) => normalizarStatus(e.status) === "visitado").length,
    naoVisitado: enderecos.filter((e) => normalizarStatus(e.status) === "nao_visitado").length,
    naoAtendeu: enderecos.filter((e) => normalizarStatus(e.status) === "nao_atendeu").length,
    novo: enderecos.filter((e) => normalizarStatus(e.status) === "novo").length,
  };
}

export function calcularProgresso(enderecos: any[]) {
  const totais = calcularTotaisEnderecos(enderecos);

  if (totais.total === 0) return 0;

  return Math.round((totais.visitado / totais.total) * 100);
}

export function agruparPorBairro<T extends { bairro?: string | null }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const bairro = item.bairro || "Sem bairro";

    if (!acc[bairro]) acc[bairro] = [];

    acc[bairro].push(item);

    return acc;
  }, {});
}