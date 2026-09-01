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
    <div className="mb-4 overflow-hidden rounded-[18px] border border-[#B78335]/25 bg-[#B78335]/8">
      <button
        type="button"
        onClick={() => setAberto((valor) => !valor)}
        className="flex min-h-16 w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-[#B78335]/6"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#B78335]/15 text-[#8A622A]">
            <Archive className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold text-[#5F451F]">
              Endereços inativos
            </p>

            <p className="mt-0.5 text-xs leading-relaxed text-[#8A622A]">
              Consultar e reativar endereços deste território
            </p>
          </div>
        </div>

        {aberto ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-[#8A622A]" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-[#8A622A]" />
        )}
      </button>

      {aberto && (
        <div className="border-t border-[#B78335]/20 p-4">
          {carregando ? (
            <p className="text-sm text-[#6E4D1F]">
              Carregando endereços inativos...
            </p>
          ) : enderecos.length === 0 ? (
            <p className="rounded-xl bg-white p-4 text-center text-sm text-[#6F7872]">
              Nenhum endereço inativo neste território.
            </p>
          ) : (
            <div className="space-y-3">
              {enderecos.map((endereco) => (
                <div
                  key={endereco.id}
                  className="rounded-[18px] border border-[#B78335]/20 bg-white p-4 shadow-[0_3px_12px_rgba(110,77,31,0.05)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#17211C]">
                        {endereco.rua || "Rua não informada"},{" "}
                        {endereco.numero || "S/N"}
                      </h3>

                      <p className="mt-1 text-sm text-[#6F7872]">
                        {endereco.bairro || "Bairro não informado"}
                        {" • "}
                        {endereco.cidade || "Cidade não informada"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {endereco.tipo && (
                          <span className="rounded-full bg-[#DCE8D5] px-2.5 py-1 text-xs font-semibold text-[#0B2B20]">
                            {endereco.tipo}
                          </span>
                        )}

                        {endereco.numero_sequencial != null && (
                          <span className="rounded-full bg-[#E9ECE5] px-2.5 py-1 text-xs font-semibold text-[#4E5B54]">
                            Endereço nº{" "}
                            {endereco.numero_sequencial}
                          </span>
                        )}
                      </div>

                      {endereco.complemento && (
                        <p className="mt-2 rounded-xl bg-[#F4F5F0] px-3 py-2 text-sm text-[#6F7872]">
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
                    className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#8FAF72]/50 bg-[#DCE8D5]/60 px-3 py-2 text-sm font-semibold text-[#2F6B4F] transition hover:bg-[#DCE8D5]"
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
