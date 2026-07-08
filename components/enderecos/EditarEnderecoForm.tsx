"use client";

import { Edit, MapPin, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  endereco: any;
};

export default function EditarEnderecoForm({ endereco }: Props) {
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState(endereco.tipo || "Casa");
  const [rua, setRua] = useState(endereco.rua || "");
  const [numero, setNumero] = useState(endereco.numero || "");
  const [complemento, setComplemento] = useState(endereco.complemento || "");
  const [latlong, setLatlong] = useState(endereco.latlong || "");
  const [observacoes, setObservacoes] = useState(endereco.observacoes || "");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
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

    const { error } = await supabase
      .from("enderecos")
      .update({
        tipo,
        rua,
        numero,
        complemento,
        latlong,
        latitude,
        longitude,
        observacoes,
      })
      .eq("id", endereco.id);

    setSalvando(false);

    if (error) return alert("Erro ao atualizar endereço.");

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
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
      >
        <Edit className="h-4 w-4" />
        Editar endereço
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
            <div className="flex items-center justify-between rounded-t-3xl border-b bg-violet-700 px-4 py-3 text-white">
              <div>
                <p className="text-xs opacity-80">Editar direção</p>
                <h2 className="text-sm font-semibold">
                  {endereco.rua}, {endereco.numero}
                </h2>
              </div>

              <button
                onClick={() => setAberto(false)}
                className="rounded-full p-1 hover:bg-white/10"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-3 p-4">
              <Campo label="Tipo">
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full rounded-xl border p-3 text-sm">
                  <option>Casa</option>
                  <option>Apartamento</option>
                  <option>Kitnet</option>
                  <option>Comércio</option>
                  <option>Outro</option>
                </select>
              </Campo>

              <Campo label="Logradouro / Rua">
                <input value={rua} onChange={(e) => setRua(e.target.value)} className="w-full rounded-xl border p-3 text-sm" />
              </Campo>

              <div className="grid grid-cols-2 gap-3">
                <Campo label="Número">
                  <input value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full rounded-xl border p-3 text-sm" />
                </Campo>

                <Campo label="Complemento">
                  <input value={complemento} onChange={(e) => setComplemento(e.target.value)} className="w-full rounded-xl border p-3 text-sm" />
                </Campo>
              </div>

              <Campo label="LatLong">
                <div className="flex gap-2">
                  <input value={latlong} onChange={(e) => setLatlong(e.target.value)} className="w-full rounded-xl border p-3 text-sm" />

                  <button onClick={usarLocalizacao} className="flex items-center gap-1 rounded-xl bg-violet-100 px-3 text-sm font-semibold text-violet-700">
                    <MapPin size={16} />
                    GPS
                  </button>
                </div>
              </Campo>

              <Campo label="Observações">
                <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="min-h-24 w-full resize-none rounded-xl border p-3 text-sm" />
              </Campo>
            </div>

            <div className="flex gap-2 border-t bg-white px-4 py-3">
              <button onClick={() => setAberto(false)} className="flex-1 rounded-xl border py-3 text-sm font-semibold text-slate-600">
                Cancelar
              </button>

              <button onClick={salvar} disabled={salvando} className="flex-1 rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white disabled:opacity-60">
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}