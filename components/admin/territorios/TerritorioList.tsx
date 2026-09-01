"use client";

import TerritorioCard, {
  type TerritorioAdmin,
} from "@/components/admin/territorios/TerritorioCard";

type Congregacao = {
  id: number;
  nome: string;
};

type Props = {
  territorios: TerritorioAdmin[];
  congregacoes: Congregacao[];
  onEditar: (territorio: TerritorioAdmin) => void;
};

export default function TerritorioList({
  territorios,
  congregacoes,
  onEditar,
}: Props) {
  if (territorios.length === 0) {
    return (
      <div className="rounded-[16px] border border-[#DDE2DB] bg-white p-5 text-center text-sm text-[#6F7872] shadow-[0_4px_16px_rgba(23,33,28,0.04)]">
        Nenhum território encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {territorios.map((territorio) => {
        const congregacao = congregacoes.find(
          (item) => item.id === territorio.congregacao_id
        );

        return (
          <TerritorioCard
            key={territorio.id}
            territorio={territorio}
            congregacaoNome={congregacao?.nome}
            onEditar={onEditar}
          />
        );
      })}
    </div>
  );
}
