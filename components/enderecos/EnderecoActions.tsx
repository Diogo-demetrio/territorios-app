"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  territorioId: number;
  cidade: string;
  bairro: string;
};

export default function NovoEnderecoForm({ territorioId, cidade, bairro }: Props) {
  const [tipo, setTipo] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [latlong, setLatlong] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvarEndereco() {
    if (!rua.trim()) {
      alert("Informe o logradouro.");
      return;
    }

    if (!numero.trim()) {
      alert("Informe o número ou S/N.");
      return;
    }

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
      tipo: tipo || "Casa",
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

    if (error) {
      alert("Erro ao cadastrar endereço.");
      console.log(error);
      return;
    }

    alert("Direção cadastrada como Novo.");
    location.reload();
  }

  return (
    <div className="mb-6 rounded-xl bg-white p-4 shadow">
      <h2 className="mb-4 text-lg font-bold">Nova direção</h2>

      <div className="space-y-3">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full rounded border p-3"
        >
          <option value="">Tipo</option>
          <option value="Casa">Casa</option>
          <option value="Apartamento">Apartamento</option>
          <option value="Kitnet">Kitnet</option>
          <option value="Comércio">Comércio</option>
          <option value="Outro">Outro</option>
        </select>

        <input
          value={rua}
          onChange={(e) => setRua(e.target.value)}
          placeholder="Logradouro / Rua"
          className="w-full rounded border p-3"
        />

        <input
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          placeholder="Número ou S/N"
          className="w-full rounded border p-3"
        />

        <input
          value={complemento}
          onChange={(e) => setComplemento(e.target.value)}
          placeholder="Complemento: cor da casa, kitnet, referência..."
          className="w-full rounded border p-3"
        />

        <input
          value={latlong}
          onChange={(e) => setLatlong(e.target.value)}
          placeholder="LatLong: -28.71321,-49.28909"
          className="w-full rounded border p-3"
        />

        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Observações da pessoa, estudo, revisita..."
          className="min-h-24 w-full rounded border p-3"
        />

        <button
          onClick={salvarEndereco}
          disabled={salvando}
          className="w-full rounded bg-[#5E3C8A] px-4 py-3 font-semibold text-white"
        >
          {salvando ? "Salvando..." : "Cadastrar como Novo"}
        </button>
      </div>
    </div>
  );
}