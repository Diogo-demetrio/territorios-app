"use client";

import dynamic from "next/dynamic";
import type { EnderecoMapa } from "@/components/maps/MapaFiltros";

const TerritorioMap = dynamic(() => import("./TerritorioMap"), {
  ssr: false,
});

export default function MapaClient({
  enderecos,
}: {
  enderecos: EnderecoMapa[];
}) {
  return <TerritorioMap enderecos={enderecos} />;
}
