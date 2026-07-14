"use client";

import Link from "next/link";
import {
  Building2,
  ChevronRight,
  Edit,
  Home,
  Map,
  MapPinned,
} from "lucide-react";

export type CidadeResumo = {
  id: number;
  nome: string;
  ativo: boolean;
  total_bairros: number;
  total_territorios: number;
  total_enderecos: number;
  total_congregacoes: number;
  congregacoes_presentes: string | null;
};

type Props = {
  cidade: CidadeResumo;
  congregacaoId?: string | null;
  onEditar: (cidade: CidadeResumo) => void;
};

export default function CidadeCard({
  cidade,
  congregacaoId,
  onEditar,
}: Props) {
  const queryCongregacao = congregacaoId
    ? `?congregacao=${congregacaoId}`
    : "";

  const rotaCidade = `/configuracoes/cidades/${cidade.id}${queryCongregacao}`;

  const textoCongregacoes =
    cidade.total_congregacoes === 0
      ? "Ainda sem território vinculado"
      : cidade.congregacoes_presentes;

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
      <Link
        href={rotaCidade}
        className="block p-4 transition hover:bg-violet-50/40"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
              <Building2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="font-bold text-slate-900">
                {cidade.nome}
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                {textoCongregacoes}
              </p>

              {cidade.total_congregacoes > 0 && (
                <p className="mt-1 text-xs font-semibold text-violet-700">
                  {cidade.total_congregacoes}{" "}
                  {cidade.total_congregacoes === 1
                    ? "congregação atendida"
                    : "congregações atendidas"}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                cidade.ativo
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {cidade.ativo ? "Ativa" : "Inativa"}
            </span>

            <ChevronRight className="h-5 w-5 text-slate-400" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Resumo
            icone={MapPinned}
            numero={cidade.total_bairros}
            titulo="Bairros"
          />

          <Resumo
            icone={Map}
            numero={cidade.total_territorios}
            titulo="Territórios"
          />

          <Resumo
            icone={Home}
            numero={cidade.total_enderecos}
            titulo="Endereços"
          />
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={() => onEditar(cidade)}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-50 py-2.5 text-sm font-semibold text-violet-700"
        >
          <Edit className="h-4 w-4" />
          Editar
        </button>

        <Link
          href={`${rotaCidade}#bairros`}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700"
        >
          <MapPinned className="h-4 w-4" />
          Bairros
        </Link>
      </div>
    </article>
  );
}

function Resumo({
  icone: Icon,
  numero,
  titulo,
}: {
  icone: typeof Map;
  numero: number;
  titulo: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-2 text-center">
      <Icon className="mx-auto h-4 w-4 text-slate-500" />

      <p className="mt-1 text-lg font-bold text-slate-900">
        {numero}
      </p>

      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {titulo}
      </p>
    </div>
  );
}