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
    <article className="rounded-[20px] border border-[#DDE2DB] bg-white p-4 shadow-[0_4px_16px_rgba(23,33,28,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold text-[#17211C]">
            {territorio.nome}
          </h2>

          <div className="mt-1 flex items-center gap-1.5 text-sm text-[#6F7872]">
            <Building2 className="h-4 w-4 shrink-0 text-[#2F6B4F]" />

            <span>
              {territorio.cidade_referencia ??
                "Cidade não informada"}
            </span>
          </div>

          {congregacaoNome && (
            <p className="mt-1 text-xs text-[#6F7872]">
              {congregacaoNome}
            </p>
          )}
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            territorio.ativo
              ? "bg-[#DCE8D5] text-[#24543F]"
              : "bg-[#E9ECE5] text-[#59635D]"
          }`}
        >
          {territorio.ativo ? "Ativo" : "Inativo"}
        </span>
      </div>

      <div className="mt-3 rounded-xl bg-[#F4F5F0] px-3 py-2.5">
        <div className="flex items-start gap-2">
          <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-[#2F6B4F]" />

          <p className="text-sm leading-relaxed text-[#6F7872]">
            {territorio.bairros_presentes ||
              territorio.bairro_referencia ||
              "Nenhum bairro informado"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <div className="inline-flex items-center gap-2 rounded-xl bg-[#DCE8D5]/60 px-3 py-2 text-xs font-semibold text-[#123D2C]">
          <MapPinned className="h-4 w-4" />
          <span>
            {territorio.total_bairros} {territorio.total_bairros === 1 ? "bairro" : "bairros"}
          </span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl bg-[#F4F5F0] px-3 py-2 text-xs font-semibold text-[#123D2C]">
          <Home className="h-4 w-4" />
          <span>
            {territorio.total_enderecos} {territorio.total_enderecos === 1 ? "endereço" : "endereços"}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onEditar(territorio)}
        className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#DDE2DB] bg-[#DCE8D5]/50 py-2.5 text-sm font-semibold text-[#123D2C] transition hover:border-[#8FAF72] active:bg-[#DCE8D5]"
      >
        <Edit className="h-4 w-4" />
        Editar território
      </button>
    </article>
  );
}
