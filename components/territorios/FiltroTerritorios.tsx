"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  territorios: any[];
};

export function FiltroTerritorios({ territorios }: Props) {
  const [busca, setBusca] = useState("");

  const filtrados = territorios.filter((t) => {
    const texto = `${t.nome} ${t.cidade} ${t.bairro}`.toLowerCase();
    return texto.includes(busca.toLowerCase());
  });

  const bairros = filtrados.reduce((acc: any, territorio: any) => {
    const bairro = territorio.bairro || "Sem bairro";
    if (!acc[bairro]) acc[bairro] = [];
    acc[bairro].push(territorio);
    return acc;
  }, {});

  return (
    <>
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Pesquisar território, bairro ou cidade..."
        className="mb-6 w-full rounded-xl border bg-white p-4 shadow"
      />

      <div className="space-y-6">
        {Object.entries(bairros).map(([bairro, lista]: any) => (
          <section key={bairro}>
            <h2 className="mb-3 text-xl font-bold">{bairro}</h2>

            <div className="space-y-3">
              {lista.map((territorio: any) => (
                <Link
                  key={territorio.id}
                  href={`/territorios/${territorio.id}`}
                  className="block rounded-xl bg-white p-4 shadow hover:bg-slate-50"
                >
                  <h3 className="text-lg font-bold">{territorio.nome}</h3>
                  <p className="text-sm text-gray-500">{territorio.cidade}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}