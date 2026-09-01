"use client";

import Link from "next/link";
import {
  Building2,
  ChevronRight,
  Edit,
  Home,
  Map,
  MapPinned,
  Users,
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
    <article className="overflow-hidden rounded-[20px] border border-[#DDE2DB] bg-white shadow-[0_4px_16px_rgba(23,33,28,0.04)]">
      <Link
        href={rotaCidade}
        className="block p-4 transition hover:bg-[#F4F5F0]/60 active:bg-[#F4F5F0]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#DCE8D5] text-[#123D2C]">
              <Building2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-[17px] font-semibold text-[#17211C]">
                {cidade.nome}
              </h2>

              <p className="mt-1 text-sm leading-snug text-[#6F7872]">
                {textoCongregacoes}
              </p>

              {cidade.total_congregacoes > 0 && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#2F6B4F]">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {cidade.total_congregacoes}{" "}
                    {cidade.total_congregacoes === 1
                      ? "congregação atendida"
                      : "congregações atendidas"}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                cidade.ativo
                  ? "bg-[#DCE8D5] text-[#24543F]"
                  : "bg-[#E9ECE5] text-[#59635D]"
              }`}
            >
              {cidade.ativo ? "Ativa" : "Inativa"}
            </span>

            <ChevronRight className="h-5 w-5 text-[#8FAF72]" />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
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

      <div className="grid grid-cols-2 gap-2 border-t border-[#DDE2DB] p-3">
        <button
          type="button"
          onClick={() => onEditar(cidade)}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DDE2DB] bg-[#DCE8D5]/50 py-2.5 text-sm font-semibold text-[#123D2C] transition hover:border-[#8FAF72] active:bg-[#DCE8D5]"
        >
          <Edit className="h-4 w-4" />
          Editar
        </button>

        <Link
          href={`${rotaCidade}#bairros`}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#F4F5F0] py-2.5 text-sm font-semibold text-[#123D2C] transition hover:bg-[#E9ECE5]"
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
    <div className="rounded-xl bg-[#F4F5F0] px-1.5 py-2 text-center">
      <Icon className="mx-auto h-4 w-4 text-[#2F6B4F]" />

      <p className="mt-0.5 text-base font-bold text-[#17211C]">
        {numero}
      </p>

      <p className="text-[9px] font-medium uppercase tracking-wide text-[#6F7872] sm:text-[10px]">
        {titulo}
      </p>
    </div>
  );
}
