"use client";

import {
  Check,
  Clipboard,
  ExternalLink,
  KeyRound,
  Mail,
  MessageCircle,
  X,
} from "lucide-react";
import { useState } from "react";

import type {
  ResultadoConvite,
} from "@/components/auth/usuarios/types";

type Props = {
  aberto: boolean;
  resultado: ResultadoConvite | null;
  fechar: () => void;
};

export default function ConviteUsuarioDialog({
  aberto,
  resultado,
  fechar,
}: Props) {
  const [copiouSenha, setCopiouSenha] =
    useState(false);

  const [copiouMensagem, setCopiouMensagem] =
    useState(false);

  if (!aberto || !resultado) {
    return null;
  }

  async function copiarTexto(
    texto: string,
    tipo: "senha" | "mensagem"
  ) {
    try {
      await navigator.clipboard.writeText(
        texto
      );

      if (tipo === "senha") {
        setCopiouSenha(true);

        window.setTimeout(() => {
          setCopiouSenha(false);
        }, 2000);
      } else {
        setCopiouMensagem(true);

        window.setTimeout(() => {
          setCopiouMensagem(false);
        }, 2000);
      }
    } catch (erro) {
      console.error(erro);

      alert(
        "Não foi possível copiar o texto."
      );
    }
  }

  function abrirWhatsApp() {
  if (!resultado) {
    return;
  }

  const telefone = resultado.usuario.telefone
    ?.replace(/\D/g, "");

    const mensagem = encodeURIComponent(
      resultado.mensagemWhatsApp
    );

    const url = telefone
      ? `https://wa.me/55${telefone}?text=${mensagem}`
      : `https://wa.me/?text=${mensagem}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0B2B20]/50 px-4 py-6 [font-family:var(--font-geist-sans),Arial,sans-serif]">
      <div className="max-h-full w-full max-w-md overflow-y-auto rounded-[24px] border border-[#DDE2DB] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F6B4F]">
              Usuário criado
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#17211C]">
              Acesso criado com sucesso
            </h2>

            <p className="mt-1 text-sm text-[#6F7872]">
              Guarde ou envie os dados agora.
            </p>
          </div>

          <button
            type="button"
            onClick={fechar}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#6F7872] hover:bg-[#F4F5F0]"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <section className="rounded-[16px] bg-[#F4F5F0] p-4">
          <div className="flex items-center gap-2 text-sm text-[#6F7872]">
            <Mail className="h-4 w-4 text-[#2F6B4F]" />

            <span className="truncate">
              {resultado.usuario.email}
            </span>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Senha temporária
            </p>

            <div className="mt-1 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <KeyRound className="h-5 w-5 shrink-0 text-amber-700" />

              <code className="min-w-0 flex-1 break-all text-base font-bold text-amber-900">
                {resultado.senhaTemporaria}
              </code>

              <button
                type="button"
                onClick={() =>
                  copiarTexto(
                    resultado.senhaTemporaria,
                    "senha"
                  )
                }
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-amber-700 shadow-sm"
                aria-label="Copiar senha"
              >
                {copiouSenha ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Clipboard className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </section>

        <div className="mt-4 rounded-[16px] border border-[#B84A4A]/20 bg-[#B84A4A]/8 p-3 text-xs leading-relaxed text-[#8F3636]">
          Esta senha será exibida somente agora. Ela não será salva
          em texto no banco de dados.
        </div>

        <section className="mt-4">
          <p className="mb-2 text-sm font-semibold text-[#17211C]">
            Mensagem para WhatsApp
          </p>

          <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-[16px] border border-[#DDE2DB] bg-[#F4F5F0] p-3 text-xs leading-relaxed text-[#17211C]">
            {resultado.mensagemWhatsApp}
          </pre>
        </section>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() =>
              copiarTexto(
                resultado.mensagemWhatsApp,
                "mensagem"
              )
            }
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-[#DDE2DB] bg-white py-3 text-sm font-semibold text-[#17211C]"
          >
            {copiouMensagem ? (
              <Check className="h-4 w-4 text-green-700" />
            ) : (
              <Clipboard className="h-4 w-4" />
            )}

            {copiouMensagem
              ? "Mensagem copiada"
              : "Copiar mensagem"}
          </button>

          <button
            type="button"
            onClick={abrirWhatsApp}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#2F6B4F] py-3 text-sm font-semibold text-white"
          >
            <MessageCircle className="h-4 w-4" />
            Abrir WhatsApp
          </button>

          <a
            href={resultado.urlAcesso}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#DCE8D5] py-3 text-sm font-semibold text-[#123D2C]"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir aplicativo
          </a>

          <button
            type="button"
            onClick={fechar}
            className="min-h-12 w-full rounded-[14px] bg-[#123D2C] py-3 text-sm font-semibold text-white"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
