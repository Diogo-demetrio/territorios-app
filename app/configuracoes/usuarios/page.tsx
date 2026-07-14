"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import UsuariosAdmin from "@/components/auth/UsuariosAdmin";
import { useAuth } from "@/components/auth/AuthProvider";

export default function UsuariosPage() {
  const searchParams = useSearchParams();
  const congregacaoId = searchParams.get("congregacao");

  const { usuario, isAdmin, carregando } = useAuth();

  const rotaVoltar = congregacaoId
    ? `/configuracoes?congregacao=${congregacaoId}`
    : "/configuracoes";

  return (
    <main className="min-h-screen bg-slate-100 p-4 pb-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center gap-3">
          <Link
            href={rotaVoltar}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
              Configurações
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Usuários
            </h1>
          </div>
        </div>

        {carregando ? (
          <div className="rounded-2xl bg-white p-4 text-sm text-slate-500">
            Verificando acesso...
          </div>
        ) : !usuario || !isAdmin ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Você não possui permissão para acessar esta página.
          </div>
        ) : (
          <UsuariosAdmin />
        )}
      </div>
    </main>
  );
}