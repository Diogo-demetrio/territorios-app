"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import UsuariosAdmin from "@/components/auth/UsuariosAdmin";
import { useAuth } from "@/components/auth/AuthProvider";

export default function UsuariosPage() {
  const {
    usuario,
    isAdmin,
    carregando,
  } = useAuth();

  return (
    <main className="min-h-screen bg-[#F4F5F0] px-4 py-5 pb-24 [font-family:var(--font-geist-sans),Arial,sans-serif] text-[#17211C] sm:py-7">
      <div className="mx-auto max-w-[820px]">
        <header className="mb-5 flex items-center gap-3">
          <Link
            href="/configuracoes"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#DDE2DB] bg-white text-[#123D2C] shadow-[0_3px_12px_rgba(23,33,28,0.05)] transition hover:border-[#8FAF72] active:bg-[#F4F5F0]"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F6B4F]">
              Configurações
            </p>

            <h1 className="text-2xl font-bold text-[#17211C] sm:text-3xl">
              Usuários
            </h1>
          </div>
        </header>

        {carregando ? (
          <div className="rounded-[16px] border border-[#DDE2DB] bg-white p-4 text-sm text-[#6F7872]">
            Verificando acesso...
          </div>
        ) : !usuario || !isAdmin ? (
          <div className="rounded-[16px] border border-[#B84A4A]/25 bg-[#B84A4A]/8 p-4 text-sm text-[#8F3636]">
            Você não possui permissão para acessar esta página.
          </div>
        ) : (
          <UsuariosAdmin />
        )}
      </div>
    </main>
  );
}
