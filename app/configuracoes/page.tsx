"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Home,
  Layers3,
  LandPlot,
  Lock,
  LogOut,
  MapPinned,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import LoginModal from "@/components/auth/LoginModal";
import { useAuth } from "@/components/auth/AuthProvider";

const modulos = [
  {
    titulo: "Limites de congregações",
    descricao: "Importar territórios macro em KML",
    href: "/configuracoes/limites-congregacoes",
    icone: LandPlot,
    somenteAdmin: true,
    somenteSuperAdmin: true,
    secao: "Mapas e limites",
  },
  {
    titulo: "Usuários",
    descricao: "Administradores e suportes",
    href: "/configuracoes/usuarios",
    icone: UserCog,
    somenteAdmin: true,
    secao: "Gestão",
  },
  {
    titulo: "Cidades",
    descricao: "Cadastro geográfico",
    href: "/configuracoes/cidades",
    icone: Building2,
    somenteAdmin: true,
    secao: "Estrutura territorial",
  },
  {
    titulo: "Bairros",
    descricao: "Bairros vinculados às cidades",
    href: "/configuracoes/bairros",
    icone: MapPinned,
    somenteAdmin: true,
    secao: "Estrutura territorial",
  },
  {
    titulo: "Territórios",
    descricao: "Criar e editar territórios",
    href: "/configuracoes/territorios",
    icone: Layers3,
    somenteAdmin: true,
    secao: "Estrutura territorial",
  },
  {
    titulo: "Endereços",
    descricao: "Cadastrar e corrigir endereços",
    href: "/configuracoes/enderecos",
    icone: Home,
    somenteAdmin: false,
    secao: "Estrutura territorial",
  },
  {
    titulo: "Publicadores",
    descricao: "Cadastro dos publicadores",
    href: "/configuracoes/publicadores",
    icone: Users,
    somenteAdmin: true,
    secao: "Congregação",
  },
  {
    titulo: "Grupos",
    descricao: "Grupos de serviço de campo",
    href: "/configuracoes/grupos",
    icone: Users,
    somenteAdmin: true,
    secao: "Congregação",
  },
];

const secoes = [
  "Gestão",
  "Estrutura territorial",
  "Congregação",
  "Mapas e limites",
] as const;

function ConfiguracoesContent() {
  const [loginAberto, setLoginAberto] = useState(false);

  const searchParams = useSearchParams();
  const congregacaoId = searchParams.get("congregacao");

  const {
    usuario,
    sair,
    isAdmin,
    isSuporte,
    carregando,
  } = useAuth();

  const rotaVoltar = congregacaoId
    ? `/congregacoes/${congregacaoId}`
    : "/";

  const modulosVisiveis = modulos.filter((modulo) => {
    if (!usuario) return false;

    if (modulo.somenteSuperAdmin) {
      return usuario.papel === "superadmin";
    }

    if (modulo.somenteAdmin) {
      return isAdmin;
    }

    return isSuporte;
  });

  return (
    <main className="min-h-screen bg-[#F4F5F0] px-4 py-5 pb-24 [font-family:var(--font-geist-sans),Arial,sans-serif] text-[#17211C] sm:py-7">
      <div className="mx-auto max-w-[820px]">
        <header className="mb-5 flex items-center gap-3">
          <Link
            href={rotaVoltar}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#DDE2DB] bg-white text-[#123D2C] shadow-[0_3px_12px_rgba(23,33,28,0.05)] transition hover:border-[#8FAF72] hover:shadow-md active:bg-[#F4F5F0]"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F6B4F]">
              Administração
            </p>

            <h1 className="text-2xl font-bold text-[#17211C] sm:text-3xl">
              Configurações
            </h1>
          </div>
        </header>

        <section className="rounded-[20px] border border-[#DDE2DB] bg-white p-4 shadow-[0_5px_20px_rgba(23,33,28,0.05)] sm:p-5">
          {carregando ? (
            <p className="text-sm text-[#6F7872]">
              Verificando acesso...
            </p>
          ) : !usuario ? (
            <>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#DCE8D5] text-[#123D2C]">
                  <Lock className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-[#17211C]">
                    Acesso de suporte/admin
                  </h2>

                  <p className="text-sm text-[#6F7872]">
                    Entre para acessar as funções administrativas.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLoginAberto(true)}
                className="min-h-12 w-full rounded-[14px] bg-[#123D2C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0B2B20] active:opacity-90"
              >
                Entrar como suporte/admin
              </button>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#DCE8D5] text-[#123D2C]">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-bold text-[#17211C]">
                    {usuario.nome}
                  </h2>

                  <span className="mt-1 inline-flex rounded-full bg-[#F4F5F0] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#2F6B4F]">
                    {usuario.papel}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => sair()}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-[#DDE2DB] bg-white px-4 py-3 text-sm font-semibold text-[#17211C] transition hover:border-[#B84A4A]/35 hover:bg-[#B84A4A]/5 active:bg-[#F4F5F0]"
              >
                <LogOut className="h-4 w-4 text-[#B84A4A]" />
                Sair do modo administrativo
              </button>
            </>
          )}
        </section>

        {usuario && (
          <div className="mt-6 space-y-7">
            {secoes.map((secao) => {
              const modulosDaSecao = modulosVisiveis.filter(
                (modulo) => modulo.secao === secao
              );

              if (modulosDaSecao.length === 0) return null;

              return (
                <section key={secao}>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#2F6B4F]">
                    {secao}
                  </h2>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {modulosDaSecao.map((modulo) => {
                      const Icon = modulo.icone;
                      const href = congregacaoId
                        ? `${modulo.href}?congregacao=${congregacaoId}`
                        : modulo.href;

                      return (
                        <Link
                          key={modulo.href}
                          href={href}
                          className="group flex min-h-[92px] items-center gap-3 rounded-[18px] border border-[#DDE2DB] bg-white p-4 shadow-[0_4px_16px_rgba(23,33,28,0.04)] transition hover:-translate-y-0.5 hover:border-[#8FAF72] hover:shadow-md active:translate-y-0 active:bg-[#F4F5F0]"
                        >
                          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#DCE8D5] text-[#123D2C]">
                            <Icon className="h-5 w-5" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold text-[#17211C]">
                              {modulo.titulo}
                            </span>
                            <span className="mt-1 block text-sm leading-snug text-[#6F7872]">
                              {modulo.descricao}
                            </span>
                          </span>

                          <ChevronRight className="h-5 w-5 shrink-0 text-[#8FAF72] transition group-hover:translate-x-0.5" />
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <LoginModal
        aberto={loginAberto}
        fechar={() => setLoginAberto(false)}
      />
    </main>
  );
}

export default function ConfiguracoesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F4F5F0] p-4 [font-family:var(--font-geist-sans),Arial,sans-serif]">
          <div className="mx-auto max-w-[820px] rounded-[20px] border border-[#DDE2DB] bg-white p-4 text-sm text-[#6F7872]">
            Carregando configurações...
          </div>
        </main>
      }
    >
      <ConfiguracoesContent />
    </Suspense>
  );
}
