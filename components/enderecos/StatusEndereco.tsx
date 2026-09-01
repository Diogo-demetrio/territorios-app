"use client";

import {
  Calendar,
  Home,
  Info,
  MessageSquare,
} from "lucide-react";

import EditarEnderecoForm from "@/components/enderecos/EditarEnderecoForm";
import EnderecoActions from "@/components/actions/EnderecoActions";
import { useAuth } from "@/components/auth/AuthProvider";

import {
  STATUS_ENDERECO,
  normalizarStatus,
} from "@/lib/status";

import {
  obterTextoEndereco,
  obterGoogleMapsUrl,
  montarMensagemEndereco,
  formatarDataBR,
} from "@/lib/endereco";

type Props = {
  endereco: any;
};

export default function StatusEndereco({
  endereco,
}: Props) {

  const { isSuporte } = useAuth();

  const statusAtual = normalizarStatus(endereco.status);
  const statusInfo = STATUS_ENDERECO[statusAtual];

  const ultimaVisita = endereco.ultima_visita || null;

  const mapsUrl = obterGoogleMapsUrl(endereco);
  const textoEndereco = obterTextoEndereco(endereco);

  const textoMensagem = montarMensagemEndereco({
    ...endereco,
    status: statusAtual,
    ultima_visita: ultimaVisita,
  });

  const tipoImovel =
    endereco.tipo &&
    endereco.tipo.toLowerCase() !== "rua"
      ? endereco.tipo
      : null;

  const numeroSequencial =
    endereco.numero_sequencial;

  function copiarEndereco() {
    navigator.clipboard.writeText(textoEndereco);
    alert("Endereço copiado!");
  }

  function copiarMensagem() {
    navigator.clipboard.writeText(textoMensagem);
    alert(
      "Mensagem copiada. Agora é só colar no WhatsApp."
    );
  }

  function abrirMaps() {
    window.open(mapsUrl, "_blank");
  }

  return (
    <div className="rounded-[20px] border border-[#DDE2DB]/90 bg-white p-4 shadow-[0_4px_16px_rgba(18,61,44,0.045)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#DCE8D5] text-[#123D2C]">
            <Home className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-[#17211C]">
              {endereco.rua}, {endereco.numero}
            </h3>

            <p className="mt-1 text-sm text-[#6F7872]">
              {endereco.bairro} • {endereco.cidade}
            </p>

            {tipoImovel && (
              <div className="mt-2">
                <span className="inline-flex rounded-full bg-[#DCE8D5] px-2.5 py-1 text-xs font-semibold text-[#0B2B20]">
                  {tipoImovel}
                </span>
              </div>
            )}
          </div>
        </div>

        {numeroSequencial != null && (
          <span className="inline-flex shrink-0 rounded-full bg-[#E9ECE5] px-2.5 py-1.5 text-xs font-semibold text-[#4E5B54]">
            Nº {numeroSequencial}
          </span>
        )}
      </div>

      {(endereco.complemento ||
        endereco.observacoes) && (
        <div className="mb-4 space-y-2">
          {endereco.complemento && (
            <div className="flex gap-2.5 rounded-xl bg-[#F4F5F0] px-3 py-2.5 text-sm text-[#17211C]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#2F6B4F]" />

              <div>
                <p className="text-xs font-semibold text-[#6F7872]">
                  Complemento
                </p>

                <p>{endereco.complemento}</p>
              </div>
            </div>
          )}

          {endereco.observacoes && (
            <div className="flex gap-2.5 rounded-xl bg-[#B78335]/10 px-3 py-2.5 text-sm text-[#6E4D1F]">
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#B78335]" />

              <div>
                <p className="text-xs font-semibold text-[#8A622A]">
                  Observações
                </p>

                <p className="whitespace-pre-line">
                  {endereco.observacoes}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {ultimaVisita && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#F4F5F0] px-3 py-2.5 text-sm text-[#6F7872]">
          <Calendar className="h-4 w-4" />

          Última visita:{" "}
          {formatarDataBR(ultimaVisita)}
        </div>
      )}

      <div
        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${statusInfo.badge}`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full ${statusInfo.dot}`}
        />

        {statusInfo.label}
      </div>

      {isSuporte && (
  <EditarEnderecoForm endereco={endereco} />
)}

      <EnderecoActions
        onMaps={abrirMaps}
        onCopiar={copiarEndereco}
        onMensagem={copiarMensagem}
      />
    </div>
  );
}
