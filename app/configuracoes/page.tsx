"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Home,
  Layers3,
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
    titulo: "Usuários",
    descricao: "Administradores e suportes",
    href: "/configuracoes/usuarios",
    icone: UserCog,
    somenteAdmin: true,
  },
  {
    titulo: "Cidades",
    descricao: "Cadastro geográfico",
    href: "/configuracoes/cidades",
    icone: Building2,
    somenteAdmin: true,
  },
  {
    titulo: "Bairros",
    descricao: "Bairros vinculados às cidades",
    href: "/configuracoes/bairros",
    icone: MapPinned,
    somenteAdmin: true,
  },
  {
    titulo: "Territórios",
    descricao: "Criar e editar territórios",
    href: "/configuracoes/territorios",
    icone: Layers3,
    somenteAdmin: true,
  },
  {
    titulo: "Endereços",
    descricao: "Cadastrar e corrigir endereços",
    href: "/configuracoes/enderecos",
    icone: Home,
    somenteAdmin: false,
  },
  {
    titulo: "Publicadores",
    descricao: "Cadastro dos publicadores",
    href: "/configuracoes/publicadores",
    icone: Users,
    somenteAdmin: true,
  },
  {
    titulo: "Grupos",
    descricao: "Grupos de serviço de campo",
    href: "/configuracoes/grupos",
    icone: Users,
    somenteAdmin: true,
  },
];

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
    if (modulo.somenteAdmin) return isAdmin;
    return isSuporte;
  });

  return (
    <main className="min-h-screen bg-slate-100 p-4 pb-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center gap-3">
          <Link
            href={rotaVoltar}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
              Administração
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Configurações
            </h1>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          {carregando ? (
            <p className="text-sm text-slate-500">
              Verificando acesso...
            </p>
          ) : !usuario ? (
            <>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                  <Lock className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Acesso de suporte/admin
                  </h2>

                  <p className="text-sm text-slate-500">
                    Entre para acessar as funções administrativas.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLoginAberto(true)}
                className="w-full rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white"
              >
                Entrar como suporte/admin
              </button>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-green-100 text-green-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    {usuario.nome}
                  </h2>

                  <p className="text-sm text-slate-500">
                    Perfil: {usuario.papel}
                  </p>
                </div>
              </div>

              <button
                onClick={() => sair()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Sair do modo administrativo
              </button>
            </>
          )}
        </div>

        {usuario && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {modulosVisiveis.map((modulo) => {
              const Icon = modulo.icone;

              return (
                <Link
                  key={modulo.href}
                  href={`${modulo.href}${
                    congregacaoId
                      ? `?congregacao=${congregacaoId}`
                      : ""
                  }`}
                  className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-violet-300"
                >
                  <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h2 className="font-bold text-slate-900">
                    {modulo.titulo}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {modulo.descricao}
                  </p>
                </Link>
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
        <main className="min-h-screen bg-slate-100 p-4">
          <div className="mx-auto max-w-3xl rounded-2xl bg-white p-4 text-sm text-slate-500">
            Carregando configurações...
          </div>
        </main>
      }
    >
      <ConfiguracoesContent />
    </Suspense>
  );
}