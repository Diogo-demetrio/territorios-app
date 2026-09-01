"use client";

import { Edit } from "lucide-react";
import { useState } from "react";

import EnderecoDialog, {
  type EnderecoEdicao,
} from "@/components/enderecos/EnderecoDialog";

type Props = {
  endereco: EnderecoEdicao & {
    territorios?: {
      congregacao_id?: number | null;
    } | null;
  };
};

export default function EditarEnderecoForm({
  endereco,
}: Props) {
  const [aberto, setAberto] = useState(false);

  const congregacaoId =
    endereco.territorios?.congregacao_id ?? null;

  function fecharDialog() {
    setAberto(false);
  }

  async function atualizarPagina() {
    window.location.reload();
  }

  if (!congregacaoId) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#DDE2DB] bg-[#F9FBF7] px-3 py-2 text-sm font-semibold text-[#2F6B4F] transition hover:border-[#8FAF72]/60 hover:bg-[#F4F7F1]"
      >
        <Edit className="h-4 w-4" />
        Editar endereço
      </button>

      <EnderecoDialog
        aberto={aberto}
        congregacaoId={congregacaoId}
        territorioInicialId={endereco.territorio_id}
        endereco={endereco}
        fechar={fecharDialog}
        aoSalvar={atualizarPagina}
      />
    </>
  );
}
