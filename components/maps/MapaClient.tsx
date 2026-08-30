"use client";

import dynamic from "next/dynamic";
import type { EnderecoMapa } from "@/components/maps/MapaFiltros";
import type { LimiteCongregacao } from "@/components/maps/types";

const TerritorioMap = dynamic(() => import("./TerritorioMap"), {
  ssr: false,
});

export default function MapaClient({
  enderecos,
  limites,
}: {
  enderecos: EnderecoMapa[];
  limites: LimiteCongregacao[];
}) {
  return <TerritorioMap enderecos={enderecos} limites={limites} />;
}
