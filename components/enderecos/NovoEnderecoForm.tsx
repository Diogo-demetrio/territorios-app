"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  territorioId: number;
  cidade: string;
  bairro: string;
};

export default function NovoEnderecoForm({ territorioId, cidade, bairro }: Props) {
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState("Casa");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [latlong, setLatlong] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvarEndereco() {
    if (!rua.trim()) return alert("Informe o logradouro.");
    if (!numero.trim()) return alert("Informe o número ou S/N.");

    let latitude = null;
    let longitude = null;

    if (latlong.includes(",")) {
      const partes = latlong.split(",");
      latitude = Number(partes[0].trim());
      longitude = Number(partes[1].trim());
    }

    setSalvando(true);

    const { error } = await supabase.from("enderecos").insert({
      territorio_id: territorioId,
      tipo,
      rua,
      numero,
      bairro,
      cidade,
      complemento,
      latlong,
      latitude,
      longitude,
      observacoes,
      status: "novo",
    });

    setSalvando(false);

    if (error) return alert("Erro ao cadastrar direção.");

    alert("Direção cadastrada como Novo.");
    location.reload();
  }

  function usarLocalizacao() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatlong(`${pos.coords.latitude},${pos.coords.longitude}`);
      },
      () => alert("Não foi possível obter a localização.")
    );
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E3C8A] text-white shadow-lg"
      >
        <Plus size={28} />
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Nova direção</h2>

              <button onClick={() => setAberto(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3">
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full rounded border p-3">
                <option>Casa</option>
                <option>Apartamento</option>
                <option>Kitnet</option>
                <option>Comércio</option>
                <option>Outro</option>
              </select>

              <input value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Logradouro / Rua" className="w-full rounded border p-3" />

              <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Número ou S/N" className="w-full rounded border p-3" />

              <input value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Complemento / referência" className="w-full rounded border p-3" />

              <div className="flex gap-2">
                <input value={latlong} onChange={(e) => setLatlong(e.target.value)} placeholder="LatLong" className="w-full rounded border p-3" />

                <button onClick={usarLocalizacao} className="rounded bg-[#5E3C8A] px-3 text-white">
                  GPS
                </button>
              </div>

              <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Observações" className="min-h-24 w-full rounded border p-3" />

              <button
                onClick={salvarEndereco}
                disabled={salvando}
                className="w-full rounded bg-[#5E3C8A] px-4 py-3 font-semibold text-white"
              >
                {salvando ? "Salvando..." : "Cadastrar como Novo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}