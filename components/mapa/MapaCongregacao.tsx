"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

type Props = {
  enderecos: any[];
};

function getColor(status: string) {
  if (status === "visitado") return "green";
  if (status === "nao_atendeu") return "orange";
  if (status === "novo") return "blue";
  return "red";
}

function getCoords(endereco: any) {
  if (endereco.latitude && endereco.longitude) {
    return [Number(endereco.latitude), Number(endereco.longitude)];
  }

  if (endereco.latlong) {
    const [lat, lng] = String(endereco.latlong)
      .replace(" ", "")
      .split(",")
      .map(Number);

    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }

  return null;
}

export default function MapaCongregacao({ enderecos }: Props) {
  const pontos = enderecos
    .map((endereco) => ({
      ...endereco,
      coords: getCoords(endereco),
    }))
    .filter((e) => e.coords);

  const centro = pontos.length ? pontos[0].coords : [-28.6775, -49.3697];

  return (
    <div className="h-[75vh] overflow-hidden rounded-xl shadow">
      <MapContainer
        center={centro as [number, number]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution="OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pontos.map((endereco) => (
          <CircleMarker
            key={endereco.id}
            center={endereco.coords as [number, number]}
            radius={8}
            pathOptions={{
              color: getColor(endereco.status),
              fillColor: getColor(endereco.status),
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <strong>
                {endereco.rua}, {endereco.numero}
              </strong>
              <br />
              {endereco.bairro} - {endereco.cidade}
              <br />
              Status: {endereco.status || "nao_visitado"}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}