"use client";

import { useEffect, useState } from "react";
import {
  Archive,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";

type EnderecoInativo = {
  id: number;
  numero_sequencial: number | null;
  tipo: string | null;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
};

type Props = {
  territorioId: number;
};

export default function EnderecosInativos({
  territorioId,
}: Props) {
  const { isSuporte } = useAuth();

  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [enderecos, setEnderecos] = useState<
    EnderecoInativo[]
  >([]);

  async function carregarInativos() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("enderecos")
      .select(`
        id,
        numero_sequencial,
        tipo,
        rua,
        numero,
        complemento,
        bairro,
        cidade
      `)
      .eq("territorio_id", territorioId)
      .eq("ativo", false)
      .order("numero_sequencial", {
        ascending: true,
        nullsFirst: false,
      })
      .order("id");

    setCarregando(false);

    if (error) {
      console.error(error);
      alert("Não foi possível carregar os endereços inativos.");
      return;
    }

    setEnderecos(data ?? []);
  }

  useEffect(() => {
    if (aberto) {
      carregarInativos();
    }
  }, [aberto, territorioId]);

  async function reativarEndereco(
    endereco: EnderecoInativo
  ) {
    const confirmar = window.confirm(
      `Reativar o endereço "${endereco.rua}, ${endereco.numero}"?`
    );

    if (!confirmar) return;

    const { data, error } = await supabase
      .from("enderecos")
      .update({ ativo: true })
      .eq("id", endereco.id)
      .select("id, ativo")
      .maybeSingle();

    if (error) {
      console.error(error);

      alert(
        `Erro ao reativar endereço: ${error.message}`
      );

      return;
    }

    if (!data || data.ativo !== true) {
      alert(
        "O endereço não foi reativado. Verifique as permissões do usuário."
      );

      return;
    }

    setEnderecos((listaAtual) =>
      listaAtual.filter(
        (item) => item.id !== endereco.id
      )
    );

    alert("Endereço reativado com sucesso.");
  }

  if (!isSuporte) {
    return null;
  }

  return (
    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50">
      <button
        type="button"
        onClick={() => setAberto((valor) => !valor)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <Archive className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold text-amber-900">
              Endereços inativos
            </p>

            <p className="text-xs text-amber-700">
              Consultar e reativar endereços deste território
            </p>
          </div>
        </div>

        {aberto ? (
          <ChevronUp className="h-5 w-5 text-amber-700" />
        ) : (
          <ChevronDown className="h-5 w-5 text-amber-700" />
        )}
      </button>

      {aberto && (
        <div className="border-t border-amber-200 p-4">
          {carregando ? (
            <p className="text-sm text-amber-800">
              Carregando endereços inativos...
            </p>
          ) : enderecos.length === 0 ? (
            <p className="rounded-xl bg-white p-4 text-center text-sm text-slate-500">
              Nenhum endereço inativo neste território.
            </p>
          ) : (
            <div className="space-y-3">
              {enderecos.map((endereco) => (
                <div
                  key={endereco.id}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-amber-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">
                        {endereco.rua || "Rua não informada"},{" "}
                        {endereco.numero || "S/N"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {endereco.bairro || "Bairro não informado"}
                        {" • "}
                        {endereco.cidade || "Cidade não informada"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {endereco.tipo && (
                          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                            {endereco.tipo}
                          </span>
                        )}

                        {endereco.numero_sequencial != null && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            Endereço nº{" "}
                            {endereco.numero_sequencial}
                          </span>
                        )}
                      </div>

                      {endereco.complemento && (
                        <p className="mt-2 text-sm text-slate-600">
                          {endereco.complemento}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      reativarEndereco(endereco)
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reativar endereço
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}