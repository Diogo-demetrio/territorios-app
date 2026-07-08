"use client";

import { Edit, Plus, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Papel = "admin" | "suporte";

type Usuario = {
  id: number;
  nome: string;
  nome_usuario: string;
  papel: Papel;
  ativo: boolean;
};

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

  const [nome, setNome] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [papel, setPapel] = useState<Papel>("suporte");
  const [salvando, setSalvando] = useState(false);

  async function carregarUsuarios() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("usuarios_app")
      .select("id, nome, nome_usuario, papel, ativo")
      .order("nome");

    setCarregando(false);

    if (error) {
      alert("Erro ao carregar usuários.");
      return;
    }

    setUsuarios((data ?? []) as Usuario[]);
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  function abrirNovoUsuario() {
    setUsuarioEditando(null);
    setNome("");
    setNomeUsuario("");
    setSenha("");
    setPapel("suporte");
    setModalAberto(true);
  }

  function abrirEditarUsuario(usuario: Usuario) {
    setUsuarioEditando(usuario);
    setNome(usuario.nome);
    setNomeUsuario(usuario.nome_usuario);
    setSenha("");
    setPapel(usuario.papel);
    setModalAberto(true);
  }

  async function salvarUsuario() {
    if (!nome.trim()) return alert("Informe o nome.");
    if (!nomeUsuario.trim()) return alert("Informe o usuário.");

    setSalvando(true);

    if (usuarioEditando) {
      const dados: any = {
        nome: nome.trim(),
        nome_usuario: nomeUsuario.trim().toLowerCase(),
        papel,
        perfil: papel,
      };

      if (senha.trim()) {
        const { error: senhaError } = await supabase.rpc("alterar_senha_usuario_app", {
          p_usuario_id: usuarioEditando.id,
          p_senha: senha,
        });

        if (senhaError) {
          setSalvando(false);
          alert("Erro ao alterar senha.");
          return;
        }
      }

      const { error } = await supabase
        .from("usuarios_app")
        .update(dados)
        .eq("id", usuarioEditando.id);

      setSalvando(false);

      if (error) {
        alert("Erro ao editar usuário.");
        return;
      }
    } else {
      if (!senha.trim()) {
        setSalvando(false);
        return alert("Informe a senha.");
      }

      const { error } = await supabase.rpc("criar_usuario_app", {
        p_congregacao_id: 2,
        p_nome: nome.trim(),
        p_nome_usuario: nomeUsuario.trim(),
        p_senha: senha,
        p_papel: papel,
      });

      setSalvando(false);

      if (error) {
        alert("Erro ao criar usuário.");
        return;
      }
    }

    setModalAberto(false);
    setUsuarioEditando(null);
    setNome("");
    setNomeUsuario("");
    setSenha("");
    setPapel("suporte");
    carregarUsuarios();
  }

  async function alternarAtivo(usuario: Usuario) {
    const confirmar = confirm(
      `${usuario.ativo ? "Desativar" : "Ativar"} o usuário ${usuario.nome}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("usuarios_app")
      .update({ ativo: !usuario.ativo })
      .eq("id", usuario.id);

    if (error) {
      alert("Erro ao alterar usuário.");
      return;
    }

    carregarUsuarios();
  }

  return (
    <div className="mt-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900">Usuários</h2>
          <p className="text-sm text-slate-500">
            Administradores e suportes do aplicativo.
          </p>
        </div>

        <button
          onClick={carregarUsuarios}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <button
        onClick={abrirNovoUsuario}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white"
      >
        <Plus className="h-4 w-4" />
        Novo usuário
      </button>

      <div className="space-y-2">
        {carregando && (
          <p className="text-sm text-slate-500">Carregando usuários...</p>
        )}

        {!carregando &&
          usuarios.map((u) => (
            <div
              key={u.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{u.nome}</h3>
                  <p className="text-sm text-slate-500">@{u.nome_usuario}</p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    u.papel === "admin"
                      ? "bg-violet-100 text-violet-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {u.papel}
                </span>
              </div>

              <p
                className={`mt-2 text-xs font-semibold ${
                  u.ativo ? "text-green-700" : "text-red-700"
                }`}
              >
                {u.ativo ? "● Ativo" : "○ Inativo"}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => abrirEditarUsuario(u)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>

                <button
                  onClick={() => alternarAtivo(u)}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold ${
                    u.ativo
                      ? "bg-red-50 text-red-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {u.ativo ? "Desativar" : "Ativar"}
                </button>
              </div>
            </div>
          ))}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {usuarioEditando ? "Editar usuário" : "Novo usuário"}
              </h2>

              <button onClick={() => setModalAberto(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome"
              className="mb-3 w-full rounded-xl border border-slate-200 p-3 text-sm"
            />

            <input
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
              placeholder="Usuário"
              className="mb-3 w-full rounded-xl border border-slate-200 p-3 text-sm"
            />

            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder={
                usuarioEditando
                  ? "Nova senha (deixe vazio para manter)"
                  : "Senha"
              }
              className="mb-3 w-full rounded-xl border border-slate-200 p-3 text-sm"
            />

            <select
              value={papel}
              onChange={(e) => setPapel(e.target.value as Papel)}
              className="mb-4 w-full rounded-xl border border-slate-200 p-3 text-sm"
            >
              <option value="suporte">Suporte</option>
              <option value="admin">Administrador</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setModalAberto(false)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600"
              >
                Cancelar
              </button>

              <button
                onClick={salvarUsuario}
                disabled={salvando}
                className="flex-1 rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}