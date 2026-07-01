"use client";

type EnderecoActionsProps = {
  texto: string;
};

export function EnderecoActions({ texto }: EnderecoActionsProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(texto)}`;

  async function copiarEndereco() {
    await navigator.clipboard.writeText(texto);
    alert("Endereço copiado!");
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        onClick={copiarEndereco}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Copiar endereço
      </button>

      <a
        href={mapsUrl}
        target="_blank"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Abrir Maps
      </a>
    </div>
  );
}