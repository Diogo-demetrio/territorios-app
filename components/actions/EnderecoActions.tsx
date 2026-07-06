"use client";

import { Copy, MapPinned, MessageCircle } from "lucide-react";

type Props = {
  onMaps: () => void;
  onCopiar: () => void;
  onMensagem: () => void;
};

export default function EnderecoActions({
  onMaps,
  onCopiar,
  onMensagem,
}: Props) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      <button
        onClick={onMaps}
        className="flex flex-col items-center justify-center gap-1 rounded-xl border border-violet-200 bg-white px-2 py-3 text-xs font-semibold text-violet-700 transition hover:bg-violet-50"
      >
        <MapPinned size={18} />
        Maps
      </button>

      <button
        onClick={onCopiar}
        className="flex flex-col items-center justify-center gap-1 rounded-xl border border-violet-200 bg-white px-2 py-3 text-xs font-semibold text-violet-700 transition hover:bg-violet-50"
      >
        <Copy size={18} />
        Copiar
      </button>

      <button
        onClick={onMensagem}
        className="flex flex-col items-center justify-center gap-1 rounded-xl border border-violet-200 bg-violet-50 px-2 py-3 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
      >
        <MessageCircle size={18} />
        WhatsApp
      </button>
    </div>
  );
}