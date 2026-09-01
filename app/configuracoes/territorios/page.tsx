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
  Suspense,
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

function TerritoriosAdminContent() {
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
  ] = useState<TerritorioAdmin | null>(null);

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
      console.error(resultadoTerritorios.error);

      alert(
        "Não foi possível carregar os territórios."
      );

      return;
    }

    if (resultadoCongregacoes.error) {
      console.error(resultadoCongregacoes.error);

      alert(
        "Não foi possível carregar as congregações."
      );

      return;
    }

    if (resultadoCidades.error) {
      console.error(resultadoCidades.error);

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
    <main className="min-h-screen bg-[#F4F5F0] px-4 py-5 pb-24 [font-family:var(--font-geist-sans),Arial,sans-serif] text-[#17211C] sm:py-7">
      <div className="mx-auto max-w-[820px]">
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
              Territórios
            </h1>
          </div>

          <button
            type="button"
            onClick={carregarDados}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#DDE2DB] bg-white text-[#123D2C] shadow-[0_3px_12px_rgba(23,33,28,0.05)] transition hover:border-[#8FAF72] hover:bg-[#F4F5F0] active:bg-[#DCE8D5]"
            aria-label="Atualizar territórios"
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
              onClick={novoTerritorio}
              className="mb-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#123D2C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0B2B20] active:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Novo território
            </button>

            <section className="mb-4 space-y-3 rounded-[20px] border border-[#DDE2DB] bg-white p-4 shadow-[0_5px_20px_rgba(23,33,28,0.05)]">
              <div className="flex h-12 items-center gap-2 rounded-[14px] border border-[#DDE2DB] bg-white px-3 transition focus-within:border-[#2F6B4F] focus-within:ring-2 focus-within:ring-[#DCE8D5]">
                <Search className="h-4 w-4 text-[#6F7872]" />

                <input
                  value={busca}
                  onChange={(event) =>
                    setBusca(event.target.value)
                  }
                  placeholder="Buscar território ou bairro"
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#17211C] outline-none placeholder:text-[#6F7872]"
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
                  className="h-12 w-full rounded-xl border border-[#DDE2DB] bg-white px-3 text-sm text-[#17211C] outline-none transition focus:border-[#2F6B4F] focus:ring-2 focus:ring-[#DCE8D5] disabled:bg-[#E9ECE5] disabled:text-[#6F7872]"
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
                  className="h-12 w-full rounded-xl border border-[#DDE2DB] bg-white px-3 text-sm text-[#17211C] outline-none transition focus:border-[#2F6B4F] focus:ring-2 focus:ring-[#DCE8D5]"
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

              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[#6F7872]">
                <input
                  type="checkbox"
                  checked={mostrarInativos}
                  onChange={(event) =>
                    setMostrarInativos(
                      event.target.checked
                    )
                  }
                  className="h-4 w-4 accent-[#123D2C]"
                />

                Mostrar territórios inativos
              </label>

              <p className="text-xs text-[#6F7872]">
                {territoriosFiltrados.length} território(s)
                encontrado(s).
              </p>
            </section>

            {carregandoDados ? (
              <div className="rounded-[16px] border border-[#DDE2DB] bg-white p-4 text-sm text-[#6F7872]">
                Carregando territórios...
              </div>
            ) : (
              <TerritorioList
                territorios={territoriosFiltrados}
                congregacoes={congregacoes}
                onEditar={editarTerritorio}
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

export default function TerritoriosAdminPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F4F5F0] p-4 [font-family:var(--font-geist-sans),Arial,sans-serif]">
          <div className="mx-auto max-w-[820px] rounded-[16px] border border-[#DDE2DB] bg-white p-4 text-sm text-[#6F7872]">
            Carregando territórios...
          </div>
        </main>
      }
    >
      <TerritoriosAdminContent />
    </Suspense>
  );
}
