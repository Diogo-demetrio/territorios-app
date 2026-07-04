"use client";

import { MapPin, Plus, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  territorioId: number;
  cidade: string;
  bairro: string;
  territorioNome?: string;
};

export default function NovoEnderecoForm({
  territorioId,
  cidade,
  bairro,
  territorioNome,
}: Props) {
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

    setAberto(false);
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
        className="fixed bottom-28 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-violet-700 text-white shadow-lg shadow-violet-700/40 hover:brightness-110"
      >
        <Plus size={28} />
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setAberto(false)}
        >
          <div
           className="mb-24 w-full max-w-3xl rounded-t-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between rounded-t-3xl border-b bg-violet-700 px-4 py-3 text-white">
              <div>
                <p className="text-xs opacity-80">Nova direção</p>
                <h2 className="text-sm font-semibold">
                  {territorioNome ?? "Território"} · {bairro}
                </h2>
                <p className="text-[11px] opacity-80">{cidade}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold">
                  Novo cadastro
                </span>

                <button
                  onClick={() => setAberto(false)}
                  className="rounded-full p-1 hover:bg-white/10"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="space-y-3 p-4">
              <Campo label="Tipo">
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full rounded-xl border p-3 text-sm outline-none focus:border-violet-500"
                >
                  <option>Casa</option>
                  <option>Apartamento</option>
                  <option>Kitnet</option>
                  <option>Comércio</option>
                  <option>Outro</option>
                </select>
              </Campo>

              <Campo label="Logradouro / Rua">
                <input
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                  placeholder="Ex.: Rua Luís Zilli"
                  className="w-full rounded-xl border p-3 text-sm outline-none focus:border-violet-500"
                />
              </Campo>

              <div className="grid grid-cols-2 gap-3">
                <Campo label="Número">
                  <input
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="128 ou S/N"
                    className="w-full rounded-xl border p-3 text-sm outline-none focus:border-violet-500"
                  />
                </Campo>

                <Campo label="Complemento">
                  <input
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    placeholder="Casa azul"
                    className="w-full rounded-xl border p-3 text-sm outline-none focus:border-violet-500"
                  />
                </Campo>
              </div>

              <Campo label="LatLong">
                <div className="flex gap-2">
                  <input
                    value={latlong}
                    onChange={(e) => setLatlong(e.target.value)}
                    placeholder="-28.7132, -49.2891"
                    className="w-full rounded-xl border p-3 text-sm outline-none focus:border-violet-500"
                  />

                  <button
                    type="button"
                    onClick={usarLocalizacao}
                    className="flex items-center gap-1 rounded-xl bg-violet-100 px-3 text-sm font-semibold text-violet-700"
                  >
                    <MapPin size={16} />
                    GPS
                  </button>
                </div>
              </Campo>

              <Campo label="Observações">
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex.: estudo, revisita, detalhes da casa..."
                  className="min-h-24 w-full resize-none rounded-xl border p-3 text-sm outline-none focus:border-violet-500"
                />
              </Campo>
            </div>

            <div className="sticky bottom-0 flex gap-2 border-t bg-white px-4 py-3">
              <button
                onClick={() => setAberto(false)}
                className="flex-1 rounded-xl border py-3 text-sm font-semibold text-slate-600"
              >
                Cancelar
              </button>

              <button
                onClick={salvarEndereco}
                disabled={salvando}
                className="flex-1 rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white disabled:opacity-60"
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

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}