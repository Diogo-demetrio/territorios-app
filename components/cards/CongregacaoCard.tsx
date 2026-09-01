import Link from "next/link";
import {
  ChevronRight,
  Globe2,
  House,
  Map,
  MapPin,
} from "lucide-react";

type Props = {
  congregacao: {
    id: number | string;
    nome: string;
    cidade_base: string | null;
    idioma: string | null;
    totalTerritorios: number;
    totalEnderecos: number;
  };
};

export default function CongregacaoCard({ congregacao }: Props) {
  return (
    <Link
      href={`/congregacoes/${congregacao.id}`}
      className="group block rounded-[20px] border border-[#DDE2DB]/90 bg-white p-4 shadow-[0_5px_20px_rgba(18,61,44,0.055)] transition duration-200 hover:-translate-y-0.5 hover:border-[#8FAF72]/60 hover:shadow-[0_10px_28px_rgba(18,61,44,0.10)] active:scale-[0.99] active:bg-[#FAFBF8] sm:p-5"
    >
      <div className="flex items-center gap-3.5 sm:gap-4">
        <div className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-[#DCE8D5] text-[#123D2C] sm:h-14 sm:w-14">
          <Map className="h-6 w-6" strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-semibold leading-snug tracking-[-0.015em] text-[#17211C] sm:text-lg">
            {congregacao.nome}
          </h2>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#6F7872]">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#2F6B4F]" />
              {congregacao.cidade_base}
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-[#8FAF72] sm:block" />

            <span className="flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 text-[#2F6B4F]" />
              {congregacao.idioma}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium sm:text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCE8D5]/70 px-2.5 py-1.5 text-[#123D2C]">
              <Map className="h-3.5 w-3.5" />
              {congregacao.totalTerritorios} territórios
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E9ECE5] px-2.5 py-1.5 text-[#4E5B54]">
              <House className="h-3.5 w-3.5" />
              {congregacao.totalEnderecos} endereços
            </span>
          </div>
        </div>

        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#8B948E] transition group-hover:bg-[#DCE8D5] group-hover:text-[#123D2C]">
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}
