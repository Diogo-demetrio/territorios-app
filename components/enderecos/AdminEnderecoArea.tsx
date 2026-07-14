"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import EnderecoDialog from "@/components/enderecos/EnderecoDialog";
import { useAuth } from "@/components/auth/AuthProvider";

type Props = {
  territorio: {
    id: number;
    congregacao_id: number;
    nome: string;
  };
};

export default function AdminEnderecoArea({
  territorio,
}: Props) {
  const { isSuporte } = useAuth();

  const [dialogAberto, setDialogAberto] =
    useState(false);

  if (!isSuporte) {
    return null;
  }

  function fecharDialog() {
    setDialogAberto(false);
  }

  async function atualizarPagina() {
    window.location.reload();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogAberto(true)}
        className="fixed bottom-28 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-violet-700 text-white shadow-lg shadow-violet-700/40 transition hover:brightness-110"
        aria-label="Novo endereço"
        title="Novo endereço"
      >
        <Plus className="h-7 w-7" />
      </button>

      <EnderecoDialog
        aberto={dialogAberto}
        congregacaoId={territorio.congregacao_id}
        territorioInicialId={territorio.id}
        endereco={null}
        fechar={fecharDialog}
        aoSalvar={atualizarPagina}
      />
    </>
  );
}