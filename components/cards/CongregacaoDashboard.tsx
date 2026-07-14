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
      <div className="rounded-3xl bg-gradient-to-br from-[#673AB7] to-[#7E57C2] p-5 text-white shadow-lg">
        <p className="text-xs uppercase opacity-80">Congregação</p>

        <h1 className="mt-1 text-2xl font-bold">{nome}</h1>

        <p className="text-sm opacity-90">{cidade}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <CardNumero numero={territorios} titulo="Territórios" />
          <CardNumero numero={enderecos} titulo="Endereços" />
          <CardNumero numero={publicadores} titulo="Publicadores" />
          <CardNumero numero={grupos} titulo="Grupos" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
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
              className="group rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100">
                  <Icon className="h-5 w-5 text-violet-700" />
                </div>

                <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:text-violet-600" />
              </div>

              <h2 className="text-sm font-semibold">{item.titulo}</h2>

              <p className="mt-1 text-xs text-gray-500">
                {item.descricao}
              </p>
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
    <div className="rounded-2xl bg-white/10 py-3 text-center">
      <div className="text-2xl font-bold leading-none">{numero}</div>

      <div className="mt-1 text-[10px] uppercase tracking-wide opacity-80">
        {titulo}
      </div>
    </div>
  );
}