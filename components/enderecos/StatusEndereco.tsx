"use client";
import EditarEnderecoForm from "@/components/enderecos/EditarEnderecoForm";
import { Calendar, Home, RotateCcw, Info, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import {
  STATUS_ENDERECO,
  normalizarStatus,
  type StatusEndereco as Status,
} from "@/lib/status";
import {
  obterTextoEndereco,
  obterGoogleMapsUrl,
  montarMensagemEndereco,
  formatarDataBR,
} from "@/lib/endereco";
import EnderecoActions from "@/components/actions/EnderecoActions";
import StatusSelector from "@/components/status/StatusSelector";

type Props = {
  endereco: any;
};

export default function StatusEndereco({ endereco }: Props) {
  const [statusAtual, setStatusAtual] = useState<Status>(
    normalizarStatus(endereco.status)
  );

  const [ultimaVisita, setUltimaVisita] = useState<string | null>(
    endereco.ultima_visita || null
  );
  const { isSuporte } = useAuth();

  const mapsUrl = obterGoogleMapsUrl(endereco);
  const textoEndereco = obterTextoEndereco(endereco);
  const textoMensagem = montarMensagemEndereco({
    ...endereco,
    status: statusAtual,
    ultima_visita: ultimaVisita,
  });

  async function alterarStatus(status: Status) {
    if (status === statusAtual) return;

    const confirmar = confirm(
      `Alterar status para "${STATUS_ENDERECO[status].label}"?`
    );
    if (!confirmar) return;

    const hoje = new Date().toISOString().split("T")[0];
    const dados =
      status === "visitado" ? { status, ultima_visita: hoje } : { status };

    setStatusAtual(status);
    if (status === "visitado") setUltimaVisita(hoje);

    const { error } = await supabase
      .from("enderecos")
      .update(dados)
      .eq("id", endereco.id);

    if (error) {
      alert("Erro ao salvar status.");
      setStatusAtual(normalizarStatus(endereco.status));
      setUltimaVisita(endereco.ultima_visita || null);
    }
  }

  async function desfazerVisita() {
    if (!confirm("Desfazer visita e limpar a data?")) return;

    setStatusAtual("nao_visitado");
    setUltimaVisita(null);

    await supabase
      .from("enderecos")
      .update({ status: "nao_visitado", ultima_visita: null })
      .eq("id", endereco.id);
  }

  function copiarEndereco() {
    navigator.clipboard.writeText(textoEndereco);
    alert("Endereço copiado!");
  }

  function copiarMensagem() {
    navigator.clipboard.writeText(textoMensagem);
    alert("Mensagem copiada!");
  }

  function abrirMaps() {
    window.open(mapsUrl, "_blank");
  }

  const statusInfo = STATUS_ENDERECO[statusAtual];

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
            <Home className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-900">
              {endereco.rua}, {endereco.numero}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {endereco.bairro} • {endereco.cidade}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusInfo.badge}`}
        >
          <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
          {statusInfo.label}
        </span>
      </div>

      {(endereco.complemento || endereco.observacoes) && (
        <div className="mb-4 space-y-2">
          {endereco.complemento && (
            <div className="flex gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Complemento
                </p>
                <p>{endereco.complemento}</p>
              </div>
            </div>
          )}

          {endereco.observacoes && (
            <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <div>
                <p className="text-xs font-semibold text-amber-700">
                  Observações
                </p>
                <p className="whitespace-pre-line">{endereco.observacoes}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {ultimaVisita && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
          <Calendar className="h-4 w-4" />
          Última visita: {formatarDataBR(ultimaVisita)}
        </div>
      )}

      {isSuporte ? (
  <StatusSelector
    statusAtual={statusAtual}
    onChange={alterarStatus}
  />
) : (
  <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-500">
    Status: <span className="font-semibold">{statusInfo.label}</span>
  </div>
)}

      {statusAtual === "visitado" && (
        <button
          onClick={desfazerVisita}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
        >
          <RotateCcw size={16} />
          Desfazer visita
        </button>
      )}
{isSuporte && <EditarEnderecoForm endereco={endereco} />}
      <EnderecoActions
        onMaps={abrirMaps}
        onCopiar={copiarEndereco}
        onMensagem={copiarMensagem}
      />
    </div>
  );
}