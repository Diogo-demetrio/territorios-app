"use client";

import { useMemo, useState } from "react";
import MapaClient from "@/components/maps/MapaClient";

export default function MapaFiltros({ enderecos }: { enderecos: any[] }) {
  const [cidade, setCidade] = useState("todos");
  const [territorio, setTerritorio] = useState("todos");
  const [status, setStatus] = useState("todos");

  const cidades = useMemo(
    () => Array.from(new Set(enderecos.map((e) => e.cidade).filter(Boolean))),
    [enderecos]
  );

  const territorios = useMemo(
    () =>
      Array.from(
        new Set(
          enderecos
            .filter((e) => cidade === "todos" || e.cidade === cidade)
            .map((e) => e.territorios?.nome)
            .filter(Boolean)
        )
      ),
    [enderecos, cidade]
  );

  const filtrados = enderecos.filter((e) => {
    const cidadeOk = cidade === "todos" || e.cidade === cidade;
    const territorioOk =
      territorio === "todos" || e.territorios?.nome === territorio;
    const statusOk =
      status === "todos" || (e.status || "nao_visitado") === status;

    return cidadeOk && territorioOk && statusOk;
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 md:grid-cols-3">
          <CampoFiltro label="Cidade">
            <select
              value={cidade}
              onChange={(e) => {
                setCidade(e.target.value);
                setTerritorio("todos");
              }}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            >
              <option value="todos">Todas as cidades</option>
              {cidades.map((c: any) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </CampoFiltro>

          <CampoFiltro label="Território">
            <select
              value={territorio}
              onChange={(e) => setTerritorio(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            >
              <option value="todos">Todos os territórios</option>
              {territorios.map((t: any) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </CampoFiltro>

          <CampoFiltro label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            >
              <option value="todos">Todos os status</option>
              <option value="visitado">Visitado</option>
              <option value="nao_visitado">Não visitado</option>
              <option value="nao_atendeu">Não atendeu</option>
              <option value="novo">Novo</option>
            </select>
          </CampoFiltro>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        📍 {filtrados.length} direções encontradas
      </p>

      <MapaClient enderecos={filtrados} />
    </div>
  );
}

function CampoFiltro({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">
        {label}
      </span>

      <div className="relative">
        {children}
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          ▾
        </span>
      </div>
    </label>
  );
}