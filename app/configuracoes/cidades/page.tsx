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
    <main className="min-h-screen bg-slate-100 p-4 pb-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center gap-3">
          <Link
            href={rotaVoltar}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
              Configurações
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Cidades
            </h1>
          </div>

          <button
            type="button"
            onClick={carregarCidades}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200"
            aria-label="Atualizar cidades"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
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
          <>
            <button
              type="button"
              onClick={novaCidade}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Nova cidade
            </button>

            {carregandoCidades ? (
              <div className="rounded-2xl bg-white p-4 text-sm text-slate-500">
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
        <main className="min-h-screen bg-slate-100 p-4">
          <div className="mx-auto max-w-3xl rounded-2xl bg-white p-4 text-sm text-slate-500">
            Carregando cidades...
          </div>
        </main>
      }
    >
      <CidadesContent />
    </Suspense>
  );
}