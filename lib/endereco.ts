import { STATUS_ENDERECO, normalizarStatus } from "@/lib/status";

export function obterTextoEndereco(endereco: any) {
  return `${endereco.rua}, ${endereco.numero}, ${endereco.bairro}, ${endereco.cidade}`;
}

export function obterGoogleMapsUrl(endereco: any) {
  if (endereco.link_google_maps) return endereco.link_google_maps;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    obterTextoEndereco(endereco)
  )}`;
}

export function formatarDataBR(data?: string | null) {
  if (!data) return "";

  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

export function montarMensagemEndereco(endereco: any) {
  const status = STATUS_ENDERECO[normalizarStatus(endereco.status)];
  const mapsUrl = obterGoogleMapsUrl(endereco);

  return `📍 ${endereco.rua}, ${endereco.numero}

Bairro: ${endereco.bairro}
Cidade: ${endereco.cidade}
Status: ${status.label}
${endereco.ultima_visita ? `Última visita: ${formatarDataBR(endereco.ultima_visita)}` : ""}

${mapsUrl}`;
}

export function montarMensagemEnderecos({
  enderecos,
  territorio,
  congregacao,
}: {
  enderecos: any[];
  territorio: any;
  congregacao: any;
}) {
  return `📍 ${congregacao?.nome ?? "Congregação"}

🗂 Território: ${territorio.nome}
📌 ${territorio.bairro} • ${territorio.cidade}

━━━━━━━━━━━━━━

${enderecos
  .map((endereco, index) => {
    const status = STATUS_ENDERECO[normalizarStatus(endereco.status)];

    return `${index + 1}) ${endereco.rua}, ${endereco.numero}

Bairro: ${endereco.bairro}
Cidade: ${endereco.cidade}
Direção nº: ${index + 1}
Status: ${status.label}

${obterGoogleMapsUrl(endereco)}`;
  })
  .join("\n\n━━━━━━━━━━━━━━\n\n")}`;
}