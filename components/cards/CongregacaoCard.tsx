import Link from "next/link";
import { ChevronRight, Globe, MapPin } from "lucide-react";

type Props = {
  congregacao: any;
};

export default function CongregacaoCard({ congregacao }: Props) {
  return (
    <Link
      href={`/congregacoes/${congregacao.id}`}
      className="block rounded-3xl bg-white p-5 shadow-sm border border-slate-100 transition hover:shadow-md"
    >
      <div className="flex items-center gap-4">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-lg font-bold text-violet-700">
          {congregacao.nome
            .split(" ")
            .filter((p: string) => p.length)
            .slice(-2)
            .map((p: string) => p[0])
            .join("")}
        </div>

        <div className="flex-1">

          <h2 className="text-xl font-semibold">
            {congregacao.nome}
          </h2>

          <div className="mt-1 flex flex-wrap gap-4 text-sm text-slate-500">

            <span className="flex items-center gap-1">
              <MapPin size={15} />
              {congregacao.cidade_base}
            </span>

            <span className="flex items-center gap-1">
              <Globe size={15} />
              {congregacao.idioma}
            </span>

          </div>

          <div className="mt-3 flex gap-6 text-sm font-medium">

            <span className="text-violet-700">
              🗺️ {congregacao.totalTerritorios} territórios
            </span>

            <span className="text-slate-600">
              🏠 {congregacao.totalEnderecos} endereços
            </span>

          </div>

        </div>

        <ChevronRight className="text-slate-400" />

      </div>
    </Link>
  );
}