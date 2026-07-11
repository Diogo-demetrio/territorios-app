"use client";

import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Cidade = {
  id: number;
  nome: string;
  ativo: boolean;
};

export default function CidadesBairrosAdmin() {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [nomeCidade, setNomeCidade] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function carregarCidades() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("cidades")
.select("id, nome, ativo")
.eq("congregacao_id", 2)
.order("nome");

    setCarregando(false);

    if (error) {
      alert(`Erro ao carregar cidades: ${error.message}`);
      return;
    }

    setCidades((data ?? []) as Cidade[]);
  }

  useEffect(() => {
    carregarCidades();
  }, []);

  async function criarCidade() {
    if (!nomeCidade.trim()) return alert("Informe o nome da cidade.");

    setSalvando(true);

    const { error } = await supabase.from("cidades").insert({
      congregacao_id: 2,
      nome: nomeCidade.trim(),
      ativo: true,
    });

    setSalvando(false);

    if (error) {
      alert(`Erro ao criar cidade: ${error.message}`);
      return;
    }

    setNomeCidade("");
    carregarCidades();
  }

  async function alternarCidade(cidade: Cidade) {
    const { error } = await supabase
      .from("cidades")
      .update({ ativo: !cidade.ativo })
      .eq("id", cidade.id);

    if (error) {
      alert("Erro ao alterar cidade.");
      return;
    }

    carregarCidades();
  }

  return (
    <div className="mt-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900">Cidades e bairros</h2>
          <p className="text-sm text-slate-500">
            Cadastre as cidades usadas nos territórios.
          </p>
        </div>

        <button
          onClick={carregarCidades}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          value={nomeCidade}
          onChange={(e) => setNomeCidade(e.target.value)}
          placeholder="Nova cidade"
          className="flex-1 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-violet-500"
        />

        <button
          onClick={criarCidade}
          disabled={salvando}
          className="rounded-xl bg-violet-700 px-4 text-white disabled:opacity-60"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-2">
        {carregando && (
          <p className="text-sm text-slate-500">Carregando cidades...</p>
        )}

        {!carregando &&
          cidades.map((cidade) => (
            <div
              key={cidade.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {cidade.nome}
                  </h3>

                  <p
                    className={`text-xs font-semibold ${
                      cidade.ativo ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {cidade.ativo ? "● Ativa" : "○ Inativa"}
                  </p>
                </div>

                <button
                  onClick={() => alternarCidade(cidade)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                    cidade.ativo
                      ? "bg-red-50 text-red-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {cidade.ativo ? "Desativar" : "Ativar"}
                </button>
              </div>
            </div>
          ))}

        {!carregando && cidades.length === 0 && (
          <p className="text-sm text-slate-500">Nenhuma cidade cadastrada.</p>
        )}
      </div>
    </div>
  );
}