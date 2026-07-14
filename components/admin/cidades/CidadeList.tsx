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
      <div className="rounded-2xl bg-white p-5 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
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