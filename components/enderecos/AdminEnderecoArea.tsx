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
  const { isAdmin } = useAuth();

  const [dialogAberto, setDialogAberto] =
    useState(false);

  if (!isAdmin) {
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
        className="fixed bottom-28 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#123D2C] text-white shadow-[0_8px_24px_rgba(11,43,32,0.30)] transition hover:bg-[#0B2B20] active:scale-95"
        style={{
          right: "max(1.5rem, calc((100vw - 760px) / 2 + 1.5rem))",
        }}
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
