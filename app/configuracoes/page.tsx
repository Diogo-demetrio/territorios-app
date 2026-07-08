"use client";

import { useState } from "react";
import { Lock, LogOut, ShieldCheck, UserCog } from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import { useAuth } from "@/components/auth/AuthProvider";
import UsuariosAdmin from "@/components/auth/UsuariosAdmin";

export default function ConfiguracoesPage() {
  const [loginAberto, setLoginAberto] = useState(false);
  const { usuario, sair, isAdmin, isSuporte } = useAuth();

  return (
    <main className="min-h-screen bg-slate-100 p-4 pb-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-2xl font-bold text-slate-900">
          Configurações
        </h1>

        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          {!usuario ? (
            <>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                  <Lock className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Área administrativa
                  </h2>
                  <p className="text-sm text-slate-500">
                    Entre para liberar funções de suporte e administração.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLoginAberto(true)}
                className="w-full rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white"
              >
                Entrar como administrador
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
                onClick={sair}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Sair do modo administrativo
              </button>
            </>
          )}
        </div>

       {isAdmin && <UsuariosAdmin />}


        {isSuporte && (
          <div className="mt-4 rounded-3xl bg-white p-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
            Modo suporte ativo. As funções de edição serão liberadas nas telas
            de território e endereços.
          </div>
        )}
      </div>

      <LoginModal aberto={loginAberto} fechar={() => setLoginAberto(false)} />
    </main>
  );
}