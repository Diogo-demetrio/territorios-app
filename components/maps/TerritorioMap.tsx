"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

type Props = {
  enderecos: any[];
};

function corStatus(status?: string) {
  if (status === "visitado") return "#16a34a";
  if (status === "nao_atendeu") return "#f97316";
  if (status === "novo") return "#2563eb";
  return "#dc2626";
}

function coordenadas(endereco: any): [number, number] | null {
  if (endereco.latitude && endereco.longitude) {
    return [Number(endereco.latitude), Number(endereco.longitude)];
  }

  if (endereco.latlong?.includes(",")) {
    const [lat, lng] = endereco.latlong.split(",").map((v: string) => Number(v.trim()));
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) return [lat, lng];
  }

  return null;
}

export default function TerritorioMap({ enderecos }: Props) {
  const pontos = enderecos
    .map((e) => ({ ...e, coords: coordenadas(e) }))
    .filter((e) => e.coords);

  const centro = pontos[0]?.coords ?? [-28.6778, -49.3697];

  return (
    <div className="relative z-0 mb-24 overflow-hidden rounded-3xl bg-white shadow ring-1 ring-slate-200">
      <MapContainer center={centro} zoom={13} className="h-[55vh] w-full">
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pontos.map((endereco) => (
          <CircleMarker
            key={endereco.id}
            center={endereco.coords}
            radius={8}
            pathOptions={{
              color: corStatus(endereco.status),
              fillColor: corStatus(endereco.status),
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <strong>{endereco.rua}, {endereco.numero}</strong>
              <br />
              {endereco.bairro} · {endereco.cidade}
              <br />
              Status: {endereco.status || "nao_visitado"}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}