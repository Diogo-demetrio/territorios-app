import Link from "next/link";
import {
  Map,
  MapPin,
  Users,
  ClipboardList,
  Settings,
  ChevronRight,
} from "lucide-react";

type Props = {
  congregacaoId: number;
  nome: string;
  cidade: string;
  territorios: number;
  enderecos: number;
  publicadores: number;
  grupos: number;
};

const itens = [
  {
    titulo: "Territórios",
    descricao: "Lista completa",
    icone: Map,
    rota: "territorios",
  },
  {
    titulo: "Mapa",
    descricao: "Mapa da congregação",
    icone: MapPin,
    rota: "mapa",
  },
  {
    titulo: "Publicadores",
    descricao: "Cadastro",
    icone: Users,
    rota: "publicadores",
  },
  {
    titulo: "Designações",
    descricao: "Designar territórios",
    icone: ClipboardList,
    rota: "designacoes",
  },
  {
    titulo: "Configurações",
    descricao: "Somente administrador",
    icone: Settings,
    rota: "configuracoes",
  },
];

export default function CongregacaoDashboard({
  congregacaoId,
  nome,
  cidade,
  territorios,
  enderecos,
  publicadores,
  grupos,
}: Props) {
  return (
    <>
      <div className="rounded-[24px] bg-[#123D2C] p-5 text-white shadow-[0_10px_28px_rgba(11,43,32,0.16)] sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#BFD0B8]">
          Congregação
        </p>

        <h1 className="mt-1.5 text-2xl font-semibold leading-tight tracking-[-0.025em] sm:text-[28px]">
          {nome}
        </h1>

        <p className="mt-1.5 text-sm text-[#DCE8D5]">{cidade}</p>

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          <CardNumero numero={territorios} titulo="Territórios" />
          <CardNumero numero={enderecos} titulo="Endereços" />
          <CardNumero numero={publicadores} titulo="Publicadores" />
          <CardNumero numero={grupos} titulo="Grupos" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {itens.map((item) => {
          const Icon = item.icone;

          const href =
            item.rota === "configuracoes"
              ? `/configuracoes?congregacao=${congregacaoId}`
              : `/congregacoes/${congregacaoId}/${item.rota}`;

          return (
            <Link
              key={item.titulo}
              href={href}
              className="group flex items-center gap-3.5 rounded-[19px] border border-[#DDE2DB]/90 bg-white p-4 shadow-[0_4px_16px_rgba(18,61,44,0.045)] transition duration-200 hover:-translate-y-0.5 hover:border-[#8FAF72]/60 hover:shadow-[0_8px_24px_rgba(18,61,44,0.09)] active:scale-[0.99]"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[15px] bg-[#DCE8D5] text-[#123D2C]">
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-[#17211C]">
                  {item.titulo}
                </h2>

                <p className="mt-0.5 text-sm text-[#6F7872]">
                  {item.descricao}
                </p>
              </div>

              <ChevronRight className="h-5 w-5 shrink-0 text-[#9AA39D] transition group-hover:text-[#2F6B4F]" />
            </Link>
          );
        })}
      </div>
    </>
  );
}

function CardNumero({
  numero,
  titulo,
}: {
  numero: number;
  titulo: string;
}) {
  return (
    <div className="rounded-[16px] border border-white/8 bg-white/10 px-2 py-3.5 text-center backdrop-blur-sm">
      <div className="text-2xl font-semibold leading-none tracking-[-0.02em]">
        {numero}
      </div>

      <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#DCE8D5]">
        {titulo}
      </div>
    </div>
  );
}
