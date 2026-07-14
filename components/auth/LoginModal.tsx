"use client";

import { useState } from "react";
import { loginUsuario } from "@/lib/auth";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginModal({
  aberto,
  fechar,
}: {
  aberto: boolean;
  fechar: () => void;
}) {
  const { recarregarUsuario } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  if (!aberto) return null;

  async function entrar() {
    if (!email.trim()) {
      return alert("Informe o e-mail.");
    }

    if (!senha.trim()) {
      return alert("Informe a senha.");
    }

    try {
      setCarregando(true);

      await loginUsuario(email, senha);
      await recarregarUsuario();

      setEmail("");
      setSenha("");
      fechar();
    } catch (error: any) {
      alert(
        error.message ||
          "E-mail ou senha inválidos."
      );
    } finally {
      setCarregando(false);
    }
  }

  function pressionarTecla(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter" && !carregando) {
      entrar();
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="mb-1 text-xl font-bold text-violet-700">
          Acesso administrativo
        </h2>

        <p className="mb-5 text-sm text-slate-500">
          Entre para acessar as funções autorizadas do
          aplicativo.
        </p>

        <label className="mb-1 block text-xs font-semibold text-slate-600">
          E-mail
        </label>

        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          onKeyDown={pressionarTecla}
          placeholder="seuemail@exemplo.com"
          className="mb-3 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-violet-500"
        />

        <label className="mb-1 block text-xs font-semibold text-slate-600">
          Senha
        </label>

        <input
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(event) =>
            setSenha(event.target.value)
          }
          onKeyDown={pressionarTecla}
          placeholder="Sua senha"
          className="mb-5 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-violet-500"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={fechar}
            disabled={carregando}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={entrar}
            disabled={carregando}
            className="flex-1 rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}