"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";

import TerritorioList from "@/components/admin/territorios/TerritorioList";
import TerritorioDialog from "@/components/admin/territorios/TerritorioDialog";

import type { TerritorioAdmin } from "@/components/admin/territorios/TerritorioCard";

type Congregacao = {
  id: number;
  nome: string;
};

type Cidade = {
  id: number;
  nome: string;
};

export default function TerritoriosAdminPage() {
  const searchParams = useSearchParams();

  const congregacaoQuery =
    searchParams.get("congregacao");

  const {
    usuario,
    isAdmin,
    carregando,
    isSuperAdmin,
  } = useAuth();

  const [territorios, setTerritorios] =
    useState<TerritorioAdmin[]>([]);

  const [congregacoes, setCongregacoes] =
    useState<Congregacao[]>([]);

  const [cidades, setCidades] =
    useState<Cidade[]>([]);

  const [busca, setBusca] = useState("");

  const [
    filtroCongregacao,
    setFiltroCongregacao,
  ] = useState(congregacaoQuery ?? "");

  const [filtroCidade, setFiltroCidade] =
    useState("");

  const [
    mostrarInativos,
    setMostrarInativos,
  ] = useState(false);

  const [
    carregandoDados,
    setCarregandoDados,
  ] = useState(true);

  const [dialogAberto, setDialogAberto] =
    useState(false);

  const [
    territorioSelecionado,
    setTerritorioSelecionado,
  ] = useState<TerritorioAdmin | null>(
    null
  );

  const rotaVoltar = congregacaoQuery
    ? `/configuracoes?congregacao=${congregacaoQuery}`
    : "/configuracoes";

  async function carregarDados() {
    setCarregandoDados(true);

    const [
      resultadoTerritorios,
      resultadoCongregacoes,
      resultadoCidades,
    ] = await Promise.all([
      supabase
        .from("v_territorios_resumo")
        .select(`
          id,
          congregacao_id,
          nome,
          numero,
          cidade_id,
          cidade_referencia,
          bairro_referencia,
          bairros_presentes,
          total_bairros,
          total_enderecos,
          ativo,
          status_designacao,
          ponto_referencia,
          observacoes
        `)
        .order("nome"),

      supabase
        .from("congregacoes")
        .select("id, nome")
        .eq("ativa", true)
        .order("nome"),

      supabase
        .from("cidades")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome"),
    ]);

    setCarregandoDados(false);

    if (resultadoTerritorios.error) {
      console.error(
        resultadoTerritorios.error
      );

      alert(
        "Não foi possível carregar os territórios."
      );

      return;
    }

    if (resultadoCongregacoes.error) {
      console.error(
        resultadoCongregacoes.error
      );

      alert(
        "Não foi possível carregar as congregações."
      );

      return;
    }

    if (resultadoCidades.error) {
      console.error(
        resultadoCidades.error
      );

      alert(
        "Não foi possível carregar as cidades."
      );

      return;
    }

    setTerritorios(
      (resultadoTerritorios.data ??
        []) as TerritorioAdmin[]
    );

    setCongregacoes(
      (resultadoCongregacoes.data ??
        []) as Congregacao[]
    );

    setCidades(
      (resultadoCidades.data ??
        []) as Cidade[]
    );
  }

  useEffect(() => {
    if (usuario && isAdmin) {
      carregarDados();
    }
  }, [usuario, isAdmin]);

  useEffect(() => {
    if (
      usuario &&
      !isSuperAdmin &&
      usuario.congregacao_id
    ) {
      setFiltroCongregacao(
        String(usuario.congregacao_id)
      );
    }
  }, [usuario, isSuperAdmin]);

  const territoriosFiltrados =
    useMemo(() => {
      const textoBusca = busca
        .trim()
        .toLowerCase();

      return territorios.filter(
        (territorio) => {
          if (
            !mostrarInativos &&
            !territorio.ativo
          ) {
            return false;
          }

          if (
            filtroCongregacao &&
            territorio.congregacao_id !==
              Number(filtroCongregacao)
          ) {
            return false;
          }

          if (
            filtroCidade &&
            territorio.cidade_id !==
              Number(filtroCidade)
          ) {
            return false;
          }

          if (!textoBusca) {
            return true;
          }

          const texto = [
            territorio.nome,
            territorio.cidade_referencia,
            territorio.bairro_referencia,
            territorio.bairros_presentes,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return texto.includes(textoBusca);
        }
      );
    }, [
      territorios,
      busca,
      filtroCongregacao,
      filtroCidade,
      mostrarInativos,
    ]);

  function novoTerritorio() {
    setTerritorioSelecionado(null);
    setDialogAberto(true);
  }

  function editarTerritorio(
    territorio: TerritorioAdmin
  ) {
    setTerritorioSelecionado(territorio);
    setDialogAberto(true);
  }

  function fecharDialog() {
    setDialogAberto(false);
    setTerritorioSelecionado(null);
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
              Territórios
            </h1>
          </div>

          <button
            type="button"
            onClick={carregarDados}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200"
            aria-label="Atualizar territórios"
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
              onClick={novoTerritorio}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Novo território
            </button>

            <section className="mb-4 space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3">
                <Search className="h-4 w-4 text-slate-500" />

                <input
                  value={busca}
                  onChange={(event) =>
                    setBusca(event.target.value)
                  }
                  placeholder="Buscar território ou bairro"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={filtroCongregacao}
                  onChange={(event) =>
                    setFiltroCongregacao(
                      event.target.value
                    )
                  }
                  disabled={!isSuperAdmin}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm disabled:bg-slate-100"
                >
                  <option value="">
                    Todas as congregações
                  </option>

                  {congregacoes.map(
                    (congregacao) => (
                      <option
                        key={congregacao.id}
                        value={congregacao.id}
                      >
                        {congregacao.nome}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={filtroCidade}
                  onChange={(event) =>
                    setFiltroCidade(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                >
                  <option value="">
                    Todas as cidades
                  </option>

                  {cidades.map((cidade) => (
                    <option
                      key={cidade.id}
                      value={cidade.id}
                    >
                      {cidade.nome}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={mostrarInativos}
                  onChange={(event) =>
                    setMostrarInativos(
                      event.target.checked
                    )
                  }
                  className="h-4 w-4"
                />

                Mostrar territórios inativos
              </label>

              <p className="text-xs text-slate-500">
                {territoriosFiltrados.length}{" "}
                território(s) encontrado(s).
              </p>
            </section>

            {carregandoDados ? (
              <div className="rounded-2xl bg-white p-4 text-sm text-slate-500">
                Carregando territórios...
              </div>
            ) : (
              <TerritorioList
                territorios={
                  territoriosFiltrados
                }
                congregacoes={congregacoes}
                onEditar={
                  editarTerritorio
                }
              />
            )}
          </>
        )}
      </div>

      <TerritorioDialog
        aberto={dialogAberto}
        territorio={territorioSelecionado}
        congregacoes={congregacoes}
        cidades={cidades}
        usuarioCongregacaoId={
          usuario?.congregacao_id ?? null
        }
        isSuperAdmin={isSuperAdmin}
        fechar={fecharDialog}
        aoSalvar={carregarDados}
      />
    </main>
  );
}