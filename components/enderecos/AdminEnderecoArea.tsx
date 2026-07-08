"use client";

import NovoEnderecoForm from "@/components/enderecos/NovoEnderecoForm";
import { useAuth } from "@/components/auth/AuthProvider";

type Props = {
  territorio: any;
};

export default function AdminEnderecoArea({ territorio }: Props) {
  const { isSuporte } = useAuth();

  if (!isSuporte) return null;

  return (
    <NovoEnderecoForm
      territorioId={territorio.id}
      cidade={territorio.cidade}
      bairro={territorio.bairro}
      territorioNome={territorio.nome}
    />
  );
}