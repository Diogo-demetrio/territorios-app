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
  const { logar } = useAuth();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  if (!aberto) return null;

  async function entrar() {
    if (!usuario.trim()) return alert("Informe o usuário.");
    if (!senha.trim()) return alert("Informe a senha.");

    try {
      setCarregando(true);

      const usuarioLogado = await loginUsuario(usuario.trim(), senha);
      logar(usuarioLogado);

      fechar();
    } catch (error: any) {
      alert(error.message || "Usuário ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="mb-1 text-xl font-bold text-violet-700">
          Login administrativo
        </h2>

        <p className="mb-5 text-sm text-slate-500">
          Entre para liberar funções de suporte e administração.
        </p>

        <input
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          placeholder="Usuário"
          className="mb-3 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-violet-500"
        />

        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Senha"
          className="mb-5 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-violet-500"
        />

        <div className="flex gap-2">
          <button
            onClick={fechar}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600"
          >
            Cancelar
          </button>

          <button
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