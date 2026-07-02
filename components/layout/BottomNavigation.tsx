import Link from "next/link";

type Props = {
  congregacaoId?: string;
};

export function BottomNavigation({ congregacaoId }: Props) {
  const base = congregacaoId ? `/congregacoes/${congregacaoId}` : "";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white shadow">
      <div className="mx-auto grid max-w-xl grid-cols-4 text-center text-xs">
        <Link href={`${base}/territorios`} className="p-3">
          <div className="text-lg">📁</div>
          Territórios
        </Link>

        <Link href={`${base}/mapa`} className="p-3">
          <div className="text-lg">🗺️</div>
          Mapa
        </Link>

        <Link href="#" className="p-3 opacity-50">
          <div className="text-lg">👥</div>
          Publicadores
        </Link>

        <Link href="#" className="p-3 opacity-50">
          <div className="text-lg">⚙️</div>
          Mais
        </Link>
      </div>
    </nav>
  );
}