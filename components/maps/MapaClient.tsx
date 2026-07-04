"use client";

import dynamic from "next/dynamic";

const TerritorioMap = dynamic(() => import("./TerritorioMap"), {
  ssr: false,
});

export default function MapaClient({ enderecos }: { enderecos: any[] }) {
  return <TerritorioMap enderecos={enderecos} />;
}