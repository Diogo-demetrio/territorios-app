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
        className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border border-[#DDE2DB] bg-white px-2 py-2.5 text-xs font-semibold text-[#123D2C] transition hover:border-[#8FAF72]/60 hover:bg-[#F9FBF7] active:scale-[0.98]"
      >
        <MapPinned size={18} />
        Maps
      </button>

      <button
        onClick={onCopiar}
        className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border border-[#DDE2DB] bg-white px-2 py-2.5 text-xs font-semibold text-[#123D2C] transition hover:border-[#8FAF72]/60 hover:bg-[#F9FBF7] active:scale-[0.98]"
      >
        <Copy size={18} />
        Copiar
      </button>

      <button
        onClick={onMensagem}
        className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border border-[#8FAF72]/50 bg-[#DCE8D5]/60 px-2 py-2.5 text-xs font-semibold text-[#123D2C] transition hover:bg-[#DCE8D5] active:scale-[0.98]"
      >
        <MessageCircle size={18} />
        WhatsApp
      </button>
    </div>
  );
}
