"use client";

import Link from "next/link";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileUp,
  LandPlot,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import type {
  CoordenadaLimite,
  LimiteCongregacao,
} from "@/components/maps/types";

type LimiteImportado = Omit<LimiteCongregacao, "id"> & {
  tipo: string;
  arquivo: string;
};

export default function LimitesCongregacoesPage() {
  const { usuario, isSuperAdmin, carregando } = useAuth();
  const [limites, setLimites] = useState<LimiteCongregacao[]>([]);
  const [previa, setPrevia] = useState<LimiteImportado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const carregarLimites = useCallback(async () => {
    setCarregandoLista(true);

    const { data, error } = await supabase
      .from("limites_congregacoes")
      .select(`
        id,
        nome,
        numero,
        idioma,
        cor,
        atualizado_origem_em,
        coordenadas
      `)
      .order("idioma")
      .order("nome");

    if (error) {
      setErro("Não foi possível carregar os limites cadastrados.");
    } else {
      setLimites((data ?? []) as LimiteCongregacao[]);
    }

    setCarregandoLista(false);
  }, []);

  useEffect(() => {
    if (!usuario || !isSuperAdmin) return;

    const temporizador = window.setTimeout(() => {
      void carregarLimites();
    }, 0);

    return () => window.clearTimeout(temporizador);
  }, [usuario, isSuperAdmin, carregarLimites]);

  async function selecionarArquivo(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";

    setErro(null);
    setMensagem(null);
    setPrevia(null);

    if (!arquivo) return;

    if (!arquivo.name.toLowerCase().endsWith(".kml")) {
      setErro("Selecione um arquivo com a extensão .kml.");
      return;
    }

    try {
      const conteudo = await arquivo.text();
      setPrevia(lerKml(conteudo, arquivo.name));
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível ler o arquivo KML."
      );
    }
  }

  async function importar() {
    if (!previa) return;

    setSalvando(true);
    setErro(null);
    setMensagem(null);

    const { error } = await supabase.from("limites_congregacoes").upsert(
      {
        nome: previa.nome,
        numero: previa.numero,
        idioma: previa.idioma,
        tipo: previa.tipo,
        coordenadas: previa.coordenadas,
        cor: previa.cor,
        atualizado_origem_em: previa.atualizado_origem_em,
        importado_em: new Date().toISOString(),
        ativo: true,
      },
      { onConflict: "numero" }
    );

    if (error) {
      console.error(error);
      setErro(
        "O KML não foi importado. Verifique sua permissão e tente novamente."
      );
    } else {
      setMensagem(
        limites.some((limite) => limite.numero === previa.numero)
          ? "Limite atualizado. A nova versão já está disponível no mapa."
          : "Limite importado. Ele já está disponível no mapa."
      );
      setPrevia(null);
      await carregarLimites();
    }

    setSalvando(false);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 pb-24">
      <div className="mx-auto max-w-3xl">
        <header className="mb-4 flex items-center gap-3">
          <Link
            href="/configuracoes"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
              Configurações
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              Limites de congregações
            </h1>
          </div>
        </header>

        {carregando ? (
          <Aviso texto="Verificando acesso..." />
        ) : !usuario || !isSuperAdmin ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Somente o superadministrador pode importar limites de congregações.
          </div>
        ) : (
          <div className="space-y-4">
            <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                  <FileUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Importar KML</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Use o arquivo do território macro baixado do JW Hub.
                  </p>
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-800">
                <FileUp className="h-4 w-4" />
                Selecionar arquivo KML
                <input
                  type="file"
                  accept=".kml,application/vnd.google-earth.kml+xml"
                  onChange={selecionarArquivo}
                  className="sr-only"
                />
              </label>

              <p className="mt-3 text-xs text-slate-500">
                O arquivo precisa representar uma congregação e conter um único
                polígono macro.
              </p>
            </section>

            {erro && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {erro}
              </div>
            )}

            {mensagem && (
              <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {mensagem}
              </div>
            )}

            {previa && (
              <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-violet-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                  Confirmar importação
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {previa.nome}
                </h2>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <Dado label="Número" valor={previa.numero ?? "Não informado"} />
                  <Dado label="Idioma" valor={previa.idioma} />
                  <Dado label="Tipo" valor={previa.tipo} />
                  <Dado
                    label="Atualizado na origem"
                    valor={formatarData(previa.atualizado_origem_em)}
                  />
                  <Dado
                    label="Polígono"
                    valor={`${previa.coordenadas.length} pontos`}
                  />
                  <Dado label="Arquivo" valor={previa.arquivo} />
                </dl>

                {limites.some((limite) => limite.numero === previa.numero) && (
                  <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-100">
                    Este número já está cadastrado. Ao confirmar, o polígono
                    existente será atualizado.
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPrevia(null)}
                    disabled={salvando}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={importar}
                    disabled={salvando}
                    className="flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
                    {salvando ? "Importando..." : "Confirmar"}
                  </button>
                </div>
              </section>
            )}

            <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-center gap-3">
                <LandPlot className="h-5 w-5 text-violet-700" />
                <h2 className="font-bold text-slate-900">Limites cadastrados</h2>
              </div>

              {carregandoLista ? (
                <Aviso texto="Carregando limites..." />
              ) : limites.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhum limite cadastrado.
                </p>
              ) : (
                <div className="space-y-2">
                  {limites.map((limite) => (
                    <div
                      key={limite.id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3"
                    >
                      <span
                        className="h-4 w-4 shrink-0 rounded-full"
                        style={{ backgroundColor: limite.cor }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-800">
                          {limite.nome}
                          {limite.numero ? ` · ${limite.numero}` : ""}
                        </p>
                        <p className="text-xs text-slate-500">
                          {limite.idioma} · {limite.coordenadas.length} pontos
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function lerKml(conteudo: string, arquivo: string): LimiteImportado {
  const documento = new DOMParser().parseFromString(conteudo, "application/xml");

  if (documento.querySelector("parsererror")) {
    throw new Error("O arquivo KML está inválido ou corrompido.");
  }

  const placemarks = elementos(documento, "Placemark").filter(
    (placemark) => elementos(placemark, "Polygon").length > 0
  );
  const poligonos = placemarks.flatMap((placemark) =>
    elementos(placemark, "Polygon")
  );

  if (placemarks.length !== 1 || poligonos.length !== 1) {
    throw new Error(
      "Este KML precisa conter exatamente um polígono macro de congregação."
    );
  }

  const placemark = placemarks[0];
  const anelExterno = elementos(poligonos[0], "outerBoundaryIs")[0];
  const textoCoordenadas = anelExterno
    ? elementos(anelExterno, "coordinates")[0]?.textContent
    : null;

  if (!textoCoordenadas) {
    throw new Error("O KML não possui coordenadas válidas para o polígono.");
  }

  const coordenadas = textoCoordenadas
    .trim()
    .split(/\s+/)
    .map((item): CoordenadaLimite => {
      const [longitude, latitude] = item.split(",").map(Number);
      return [latitude, longitude];
    })
    .filter(
      ([latitude, longitude]) =>
        Number.isFinite(latitude) && Number.isFinite(longitude)
    );

  if (coordenadas.length < 4) {
    throw new Error("O polígono do KML possui poucos pontos válidos.");
  }

  const primeiro = coordenadas[0];
  const ultimo = coordenadas[coordenadas.length - 1];
  if (primeiro[0] !== ultimo[0] || primeiro[1] !== ultimo[1]) {
    coordenadas.push([...primeiro]);
  }

  const nomeDocumento = textoPrimeiro(documento, "Document", "name");
  const nome = dadoEstendido(placemark, "Name") ||
    textoFilho(placemark, "name") ||
    nomeDocumento ||
    arquivo.replace(/\.kml$/i, "");
  const numero = extrairNumero(nomeDocumento, arquivo);
  const idioma = dadoEstendido(placemark, "Language");

  if (!numero) {
    throw new Error(
      "Não encontrei o número da congregação no nome do arquivo KML."
    );
  }

  if (!idioma) {
    throw new Error("Não encontrei o idioma da congregação no arquivo KML.");
  }

  return {
    nome,
    numero,
    idioma,
    tipo: dadoEstendido(placemark, "Type") || "Território de congregação",
    atualizado_origem_em: dadoEstendido(placemark, "LastUpdatedIso") || null,
    coordenadas,
    cor: corPorIdioma(idioma),
    arquivo,
  };
}

function elementos(raiz: Document | Element, nome: string) {
  return Array.from(raiz.getElementsByTagNameNS("*", nome));
}

function textoFilho(elemento: Element, nome: string) {
  return Array.from(elemento.children).find(
    (filho) => filho.localName === nome
  )?.textContent?.trim() || null;
}

function textoPrimeiro(documento: Document, pai: string, filho: string) {
  const elementoPai = elementos(documento, pai)[0];
  return elementoPai ? textoFilho(elementoPai, filho) : null;
}

function dadoEstendido(placemark: Element, nome: string) {
  const dado = elementos(placemark, "Data").find(
    (item) => item.getAttribute("name") === nome
  );
  return dado ? elementos(dado, "value")[0]?.textContent?.trim() || null : null;
}

function extrairNumero(...valores: Array<string | null>) {
  for (const valor of valores) {
    const numero = valor?.match(/\((\d+)\)/)?.[1];
    if (numero) return numero;
  }
  return null;
}

function corPorIdioma(idioma: string) {
  const normalizado = idioma.toLocaleLowerCase("pt-BR");
  if (normalizado.includes("espanhol")) return "#dc2626";
  if (normalizado.includes("sinais")) return "#16a34a";
  if (normalizado.includes("crioulo")) return "#d97706";
  return "#2563eb";
}

function formatarData(data: string | null) {
  if (!data) return "Não informada";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(`${data}T00:00:00Z`)
  );
}

function Aviso({ texto }: { texto: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-sm text-slate-500">
      {texto}
    </div>
  );
}

function Dado({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 break-words font-medium text-slate-700">{valor}</dd>
    </div>
  );
}
