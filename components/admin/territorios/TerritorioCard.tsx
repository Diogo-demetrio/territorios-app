"use client";

import {
  Building2,
  Edit,
  Home,
  MapPinned,
} from "lucide-react";

export type TerritorioAdmin = {
  id: number;
  congregacao_id: number;
  nome: string;
  numero: number | null;
  cidade_id: number | null;
  cidade_referencia: string | null;
  bairro_referencia: string | null;
  bairros_presentes: string | null;
  total_bairros: number;
  total_enderecos: number;
  ativo: boolean;
  status_designacao: string | null;
  ponto_referencia: string | null;
  observacoes: string | null;
};

type Props = {
  territorio: TerritorioAdmin;
  congregacaoNome?: string;
  onEditar: (territorio: TerritorioAdmin) => void;
};

export default function TerritorioCard({
  territorio,
  congregacaoNome,
  onEditar,
}: Props) {
  return (
    <article className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-bold text-slate-900">
            {territorio.nome}
          </h2>

          <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <Building2 className="h-4 w-4 shrink-0" />

            <span>
              {territorio.cidade_referencia ??
                "Cidade não informada"}
            </span>
          </div>

          {congregacaoNome && (
            <p className="mt-1 text-xs text-slate-500">
              {congregacaoNome}
            </p>
          )}
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            territorio.ativo
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {territorio.ativo ? "Ativo" : "Inativo"}
        </span>
      </div>

      <div className="mt-3 rounded-2xl bg-slate-50 p-3">
        <div className="flex items-start gap-2">
          <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />

          <p className="text-sm leading-relaxed text-slate-600">
            {territorio.bairros_presentes ||
              territorio.bairro_referencia ||
              "Nenhum bairro informado"}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-slate-50 p-2 text-center">
          <MapPinned className="mx-auto h-4 w-4 text-slate-500" />

          <p className="mt-1 text-lg font-bold text-slate-900">
            {territorio.total_bairros}
          </p>

          <p className="text-[10px] uppercase tracking-wide text-slate-500">
            Bairros
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-2 text-center">
          <Home className="mx-auto h-4 w-4 text-slate-500" />

          <p className="mt-1 text-lg font-bold text-slate-900">
            {territorio.total_enderecos}
          </p>

          <p className="text-[10px] uppercase tracking-wide text-slate-500">
            Endereços
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onEditar(territorio)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-50 py-2.5 text-sm font-semibold text-violet-700"
      >
        <Edit className="h-4 w-4" />
        Editar território
      </button>
    </article>
  );
}