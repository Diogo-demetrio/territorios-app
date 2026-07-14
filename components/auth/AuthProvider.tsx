"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import {
  buscarPerfilUsuario,
  sairUsuario,
  type UsuarioApp,
} from "@/lib/auth";

type AuthContextValue = {
  usuario: UsuarioApp | null;
  carregando: boolean;
  sair: () => Promise<void>;
  recarregarUsuario: () => Promise<void>;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isSuporte: boolean;
  podeExcluir: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [usuario, setUsuario] = useState<UsuarioApp | null>(
    null
  );

  const [carregando, setCarregando] = useState(true);

  async function carregarUsuarioAtual() {
    try {
      const perfil = await buscarPerfilUsuario();
      setUsuario(perfil);
    } catch (error) {
      console.error(error);
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }

  async function recarregarUsuario() {
    setCarregando(true);
    await carregarUsuarioAtual();
  }

  async function sair() {
    try {
      await sairUsuario();
      setUsuario(null);
    } catch (error: any) {
      alert(error.message || "Não foi possível sair.");
    }
  }

  useEffect(() => {
    let ativo = true;

    async function iniciarSessao() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!ativo) return;

      if (!session?.user) {
        setUsuario(null);
        setCarregando(false);
        return;
      }

      try {
        const perfil = await buscarPerfilUsuario(
          session.user
        );

        if (ativo) {
          setUsuario(perfil);
        }
      } catch (error) {
        console.error(error);

        if (ativo) {
          setUsuario(null);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    iniciarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (evento, session) => {
        if (!ativo) return;

        if (
          evento === "SIGNED_OUT" ||
          !session?.user
        ) {
          setUsuario(null);
          setCarregando(false);
          return;
        }

        if (
          evento === "SIGNED_IN" ||
          evento === "TOKEN_REFRESHED" ||
          evento === "USER_UPDATED"
        ) {
          try {
            const perfil = await buscarPerfilUsuario(
              session.user
            );

            if (ativo) {
              setUsuario(perfil);
            }
          } catch (error) {
            console.error(error);

            if (ativo) {
              setUsuario(null);
            }
          } finally {
            if (ativo) {
              setCarregando(false);
            }
          }
        }
      }
    );

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      carregando,
      sair,
      recarregarUsuario,
      isSuperAdmin: usuario?.papel === "superadmin",
      isAdmin:
        usuario?.papel === "superadmin" ||
        usuario?.papel === "admin",
      isSuporte:
        usuario?.papel === "superadmin" ||
        usuario?.papel === "admin" ||
        usuario?.papel === "suporte",
      podeExcluir: usuario?.papel === "superadmin",
    }),
    [usuario, carregando]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth deve ser usado dentro de AuthProvider"
    );
  }

  return context;
}