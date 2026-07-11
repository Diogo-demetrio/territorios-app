import { STATUS_ENDERECO, normalizarStatus } from "@/lib/status";

export function obterTextoEndereco(endereco: any) {
  const rua = endereco.rua?.trim();
  const numero = endereco.numero?.trim();
  const bairro =
    endereco.bairros?.nome?.trim() ||
    endereco.bairro?.trim();

  const cidade =
    endereco.cidades?.nome?.trim() ||
    endereco.cidade?.trim();

  return [rua, numero, bairro, cidade]
    .filter(Boolean)
    .join(", ");
}

function numeroValido(valor: unknown) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  const numero =
    typeof valor === "number"
      ? valor
      : Number(String(valor).replace(",", ".").trim());

  return Number.isFinite(numero) ? numero : null;
}

function obterCoordenadas(endereco: any) {
  const latitude = numeroValido(endereco.latitude);
  const longitude = numeroValido(endereco.longitude);

  if (latitude !== null && longitude !== null) {
    return {
      latitude,
      longitude,
    };
  }

  if (endereco.latlong) {
    const partes = String(endereco.latlong)
      .split(",")
      .map((parte) => parte.trim());

    if (partes.length >= 2) {
      const latitudeLatLong = numeroValido(partes[0]);
      const longitudeLatLong = numeroValido(partes[1]);

      if (
        latitudeLatLong !== null &&
        longitudeLatLong !== null
      ) {
        return {
          latitude: latitudeLatLong,
          longitude: longitudeLatLong,
        };
      }
    }
  }

  return null;
}

function linkGoogleMapsValido(link: unknown) {
  if (!link || typeof link !== "string") {
    return false;
  }

  const texto = link.trim();

  if (!texto.startsWith("http://") && !texto.startsWith("https://")) {
    return false;
  }

  return (
    texto.includes("google.com/maps") ||
    texto.includes("maps.google.com") ||
    texto.includes("maps.app.goo.gl") ||
    texto.includes("goo.gl/maps")
  );
}

export function obterGoogleMapsUrl(endereco: any) {
  const coordenadas = obterCoordenadas(endereco);

  if (coordenadas) {
    return `https://www.google.com/maps/search/?api=1&query=${coordenadas.latitude},${coordenadas.longitude}`;
  }

  if (linkGoogleMapsValido(endereco.link_google_maps)) {
    return endereco.link_google_maps.trim();
  }

  const textoEndereco = obterTextoEndereco(endereco);

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    textoEndereco
  )}`;
}

export function formatarDataBR(data?: string | null) {
  if (!data) return "";

  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
}

export function montarMensagemEndereco(endereco: any) {
  const status =
    STATUS_ENDERECO[normalizarStatus(endereco.status)];

  const mapsUrl = obterGoogleMapsUrl(endereco);

  const bairro =
    endereco.bairros?.nome ||
    endereco.bairro ||
    "Não informado";

  const cidade =
    endereco.cidades?.nome ||
    endereco.cidade ||
    "Não informada";

  return `📍 ${endereco.rua}, ${endereco.numero}

Bairro: ${bairro}
Cidade: ${cidade}
Status: ${status.label}
${
  endereco.ultima_visita
    ? `Última visita: ${formatarDataBR(endereco.ultima_visita)}`
    : ""
}

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
  const localizacaoTerritorio =
    territorio.bairros_presentes ||
    territorio.bairro ||
    "Bairros não informados";

  const cidadeTerritorio =
    territorio.cidades_presentes ||
    territorio.cidade ||
    "Cidade não informada";

  return `📍 ${congregacao?.nome ?? "Congregação"}

🗂 Território: ${territorio.nome}
📌 ${localizacaoTerritorio} • ${cidadeTerritorio}

━━━━━━━━━━━━━━

${enderecos
  .map((endereco, index) => {
    const status =
      STATUS_ENDERECO[normalizarStatus(endereco.status)];

    const bairro =
      endereco.bairros?.nome ||
      endereco.bairro ||
      "Não informado";

    const cidade =
      endereco.cidades?.nome ||
      endereco.cidade ||
      "Não informada";

    return `${index + 1}) ${endereco.rua}, ${endereco.numero}

Bairro: ${bairro}
Cidade: ${cidade}
Direção nº: ${endereco.numero_sequencial ?? index + 1}
Status: ${status.label}

${obterGoogleMapsUrl(endereco)}`;
  })
  .join("\n\n━━━━━━━━━━━━━━\n\n")}`;
}