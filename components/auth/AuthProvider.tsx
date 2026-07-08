"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  limparSessao,
  obterSessao,
  salvarSessao,
  type UsuarioApp,
} from "@/lib/auth";

type AuthContextValue = {
  usuario: UsuarioApp | null;
  logar: (usuario: UsuarioApp) => void;
  sair: () => void;
  isAdmin: boolean;
  isSuporte: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioApp | null>(null);

  useEffect(() => {
    setUsuario(obterSessao());
  }, []);

  function logar(usuario: UsuarioApp) {
    salvarSessao(usuario);
    setUsuario(usuario);
  }

  function sair() {
    limparSessao();
    setUsuario(null);
  }

  const value = useMemo(
    () => ({
      usuario,
      logar,
      sair,
      isAdmin: usuario?.papel === "admin",
      isSuporte: usuario?.papel === "admin" || usuario?.papel === "suporte",
    }),
    [usuario]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}