"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Props = {
  territorios: any[];
};

export function FiltroTerritorios({ territorios }: Props) {
  const [busca, setBusca] = useState("");

  const agrupados = useMemo(() => {
    const filtrados = territorios.filter((t) =>
      `${t.nome} ${t.bairro} ${t.cidade}`.toLowerCase().includes(busca.toLowerCase())
    );

    return filtrados.reduce((acc: any, territorio: any) => {
      const bairro = territorio.bairro || "Sem bairro";
      if (!acc[bairro]) acc[bairro] = [];
      acc[bairro].push(territorio);
      return acc;
    }, {});
  }, [busca, territorios]);

  return (
    <>
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, bairro ou cidade"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
        />
      </div>

      {Object.entries(agrupados).map(([bairro, lista]: any) => (
        <section key={bairro} className="mb-6">
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {bairro}
          </h2>

          <div className="space-y-3">
            {lista.map((territorio: any) => {
              const enderecos = territorio.enderecos ?? [];
              const total = enderecos.length;

              const visitado = enderecos.filter((e: any) => e.status === "visitado").length;
              const naoVisitado = enderecos.filter((e: any) => e.status === "nao_visitado" || !e.status).length;
              const naoAtendeu = enderecos.filter((e: any) => e.status === "nao_atendeu").length;
              const novo = enderecos.filter((e: any) => e.status === "novo").length;

              return (
                <Link
                  key={territorio.id}
                  href={`/territorios/${territorio.id}`}
                  className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-violet-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">{territorio.nome}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {territorio.cidade} · {territorio.bairro}
                      </p>
                    </div>

                    <span className="rounded-lg bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700">
                      {total} end.
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <StatusBadge status="visitado" count={visitado} />
                    <StatusBadge status="nao_visitado" count={naoVisitado} />
                    <StatusBadge status="nao_atendeu" count={naoAtendeu} />
                    <StatusBadge status="novo" count={novo} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}