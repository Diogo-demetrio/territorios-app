"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import CidadeList from "@/components/admin/cidades/CidadeList";
import type { CidadeResumo } from "@/components/admin/cidades/CidadeCard";

function CidadesContent() {
  const searchParams = useSearchParams();
  const congregacaoId = searchParams.get("congregacao");

  const { usuario, isAdmin, carregando } = useAuth();

  const [cidades, setCidades] = useState<CidadeResumo[]>([]);
  const [carregandoCidades, setCarregandoCidades] =
    useState(true);

  const rotaVoltar = congregacaoId
    ? `/configuracoes?congregacao=${congregacaoId}`
    : "/configuracoes";

  async function carregarCidades() {
    setCarregandoCidades(true);

    const { data, error } = await supabase
      .from("v_cidades_resumo")
      .select(`
        id,
        nome,
        ativo,
        total_bairros,
        total_territorios,
        total_enderecos,
        total_congregacoes,
        congregacoes_presentes
      `)
      .order("nome");

    setCarregandoCidades(false);

    if (error) {
      console.error(error);
      alert("Não foi possível carregar as cidades.");
      return;
    }

    setCidades((data ?? []) as CidadeResumo[]);
  }

  useEffect(() => {
    if (usuario && isAdmin) {
      carregarCidades();
    }
  }, [usuario, isAdmin]);

  function editarCidade(cidade: CidadeResumo) {
    alert(`Próxima etapa: editar ${cidade.nome}.`);
  }

  function novaCidade() {
    alert("Próxima etapa: cadastrar uma nova cidade.");
  }

  return (
    <main className="min-h-screen bg-[#F4F5F0] px-4 py-5 pb-24 [font-family:var(--font-geist-sans),Arial,sans-serif] text-[#17211C] sm:py-7">
      <div className="mx-auto max-w-[900px]">
        <header className="mb-5 flex items-center gap-3">
          <Link
            href={rotaVoltar}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#DDE2DB] bg-white text-[#123D2C] shadow-[0_3px_12px_rgba(23,33,28,0.05)] transition hover:border-[#8FAF72] active:bg-[#F4F5F0]"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F6B4F]">
              Configurações
            </p>

            <h1 className="text-2xl font-bold text-[#17211C] sm:text-3xl">
              Cidades
            </h1>
          </div>

          <button
            type="button"
            onClick={carregarCidades}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#DDE2DB] bg-white text-[#123D2C] shadow-[0_3px_12px_rgba(23,33,28,0.05)] transition hover:border-[#8FAF72] hover:bg-[#F4F5F0] active:bg-[#DCE8D5]"
            aria-label="Atualizar cidades"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
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
          <>
            <button
              type="button"
              onClick={novaCidade}
              className="mb-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#123D2C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0B2B20] active:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Nova cidade
            </button>

            {carregandoCidades ? (
              <div className="rounded-[16px] border border-[#DDE2DB] bg-white p-4 text-sm text-[#6F7872]">
                Carregando cidades...
              </div>
            ) : (
              <CidadeList
  cidades={cidades}
  congregacaoId={congregacaoId}
  onEditar={editarCidade}
/>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function CidadesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F4F5F0] p-4 [font-family:var(--font-geist-sans),Arial,sans-serif]">
          <div className="mx-auto max-w-[900px] rounded-[16px] border border-[#DDE2DB] bg-white p-4 text-sm text-[#6F7872]">
            Carregando cidades...
          </div>
        </main>
      }
    >
      <CidadesContent />
    </Suspense>
  );
}
