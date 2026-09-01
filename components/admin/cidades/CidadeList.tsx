"use client";

import CidadeCard, {
  type CidadeResumo,
} from "@/components/admin/cidades/CidadeCard";

type Props = {
  cidades: CidadeResumo[];
  congregacaoId?: string | null;
  onEditar: (cidade: CidadeResumo) => void;
};

export default function CidadeList({
  cidades,
  congregacaoId,
  onEditar,
}: Props) {
  if (cidades.length === 0) {
    return (
      <div className="rounded-[16px] border border-[#DDE2DB] bg-white p-5 text-center text-sm text-[#6F7872] shadow-[0_4px_16px_rgba(23,33,28,0.04)]">
        Nenhuma cidade encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cidades.map((cidade) => (
        <CidadeCard
          key={cidade.id}
          cidade={cidade}
          congregacaoId={congregacaoId}
          onEditar={onEditar}
        />
      ))}
    </div>
  );
}
