"use client";

import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Map, MapPinned, Navigation, CheckCircle } from "lucide-react";

import { STATUS_ENDERECO, normalizarStatus } from "@/lib/status";

type Props = {
  enderecos: any[];
};

function coordenadas(endereco: any): [number, number] | null {
  if (endereco.latitude && endereco.longitude) {
    return [Number(endereco.latitude), Number(endereco.longitude)];
  }

  if (endereco.latlong?.includes(",")) {
    const [lat, lng] = endereco.latlong
      .split(",")
      .map((v: string) => Number(v.trim()));

    if (!Number.isNaN(lat) && !Number.isNaN(lng)) return [lat, lng];
  }

  return null;
}

function AjustarZoom({ pontos }: { pontos: any[] }) {
  const map = useMap();

  if (pontos.length > 0) {
    setTimeout(() => {
      const bounds = L.latLngBounds(pontos.map((p) => p.coords));
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 17,
      });
    }, 100);
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

        <AjustarZoom pontos={pontos} />

        {pontos.map((endereco) => {
          const mapsUrl =
            endereco.link_google_maps ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${endereco.rua}, ${endereco.numero}, ${endereco.bairro}, ${endereco.cidade}`
            )}`;

          const status = STATUS_ENDERECO[normalizarStatus(endereco.status)];

          return (
            <CircleMarker
              key={endereco.id}
              center={endereco.coords}
              radius={9}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor: status.pin,
                fillOpacity: 0.95,
              }}
            >
              <Popup>
                <div className="w-[300px] space-y-3 text-slate-800">
                  <div>
                    <h3 className="text-lg font-bold leading-tight">
                      {endereco.rua}, {endereco.numero}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      {endereco.bairro} · {endereco.cidade}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Map className="h-4 w-4 text-violet-700" />
                    <span>Território:</span>
                    <span className="font-semibold text-violet-700">
                      {endereco.territorios?.nome}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">Status:</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.badge}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`/territorios/${endereco.territorios?.id}`}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-violet-700 bg-white px-3 py-2 text-sm font-semibold !text-violet-700 no-underline shadow-sm hover:bg-violet-50"
                    >
                      <MapPinned className="h-4 w-4" />
                      Abrir
                    </a>

                    <a
                      href={mapsUrl}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-violet-700 px-3 py-2 text-sm font-semibold !text-white no-underline shadow-sm hover:bg-violet-800"
                    >
                      <Navigation className="h-4 w-4" />
                      Maps
                    </a>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}