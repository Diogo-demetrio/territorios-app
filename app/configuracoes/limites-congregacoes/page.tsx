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
    <main className="min-h-screen bg-[#F4F5F0] px-4 py-5 pb-24 [font-family:var(--font-geist-sans),Arial,sans-serif] text-[#17211C] sm:py-7">
      <div className="mx-auto max-w-[820px]">
        <header className="mb-5 flex items-center gap-3">
          <Link
            href="/configuracoes"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#DDE2DB] bg-white text-[#123D2C] shadow-[0_3px_12px_rgba(23,33,28,0.05)] transition hover:border-[#8FAF72] active:bg-[#F4F5F0]"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F6B4F]">
              Configurações
            </p>
            <h1 className="text-2xl font-bold leading-tight text-[#17211C] sm:text-3xl">
              Limites de congregações
            </h1>
          </div>
        </header>

        {carregando ? (
          <Aviso texto="Verificando acesso..." />
        ) : !usuario || !isSuperAdmin ? (
          <div className="rounded-[16px] border border-[#B84A4A]/25 bg-[#B84A4A]/8 p-4 text-sm text-[#8F3636]">
            Somente o superadministrador pode importar limites de congregações.
          </div>
        ) : (
          <div className="space-y-4">
            <section className="rounded-[20px] border border-[#DDE2DB] bg-white p-4 shadow-[0_5px_20px_rgba(23,33,28,0.05)] sm:p-5">
              <div className="mb-4 flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#DCE8D5] text-[#123D2C]">
                  <FileUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-[#17211C]">Importar KML</h2>
                  <p className="mt-1 text-sm text-[#6F7872]">
                    Use o arquivo do território macro baixado do JW Hub.
                  </p>
                </div>
              </div>

              <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[#123D2C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0B2B20] active:opacity-90">
                <FileUp className="h-4 w-4" />
                Selecionar arquivo KML
                <input
                  type="file"
                  accept=".kml,application/vnd.google-earth.kml+xml"
                  onChange={selecionarArquivo}
                  className="sr-only"
                />
              </label>

              <p className="mt-3 text-xs leading-relaxed text-[#6F7872]">
                O arquivo precisa representar uma congregação e conter um único
                polígono macro.
              </p>
            </section>

            {erro && (
              <div className="rounded-[16px] border border-[#B84A4A]/25 bg-[#B84A4A]/8 p-4 text-sm text-[#8F3636]">
                {erro}
              </div>
            )}

            {mensagem && (
              <div className="flex items-center gap-2 rounded-[16px] border border-[#2F6B4F]/20 bg-[#DCE8D5]/60 p-4 text-sm text-[#24543F]">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {mensagem}
              </div>
            )}

            {previa && (
              <section className="rounded-[20px] border border-[#8FAF72] bg-white p-4 shadow-[0_5px_20px_rgba(23,33,28,0.05)] sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F6B4F]">
                  Confirmar importação
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#17211C]">
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
                  <p className="mt-4 rounded-xl border border-[#B78335]/20 bg-[#B78335]/10 p-3 text-sm text-[#805A23]">
                    Este número já está cadastrado. Ao confirmar, o polígono
                    existente será atualizado.
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPrevia(null)}
                    disabled={salvando}
                    className="min-h-12 rounded-[14px] border border-[#DDE2DB] bg-white px-4 py-3 text-sm font-semibold text-[#17211C] transition hover:bg-[#F4F5F0] disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={importar}
                    disabled={salvando}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-[#123D2C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0B2B20] disabled:opacity-50"
                  >
                    {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
                    {salvando ? "Importando..." : "Confirmar"}
                  </button>
                </div>
              </section>
            )}

            <section className="rounded-[20px] border border-[#DDE2DB] bg-white p-4 shadow-[0_5px_20px_rgba(23,33,28,0.05)] sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#DCE8D5] text-[#123D2C]">
                  <LandPlot className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold text-[#17211C]">Limites cadastrados</h2>
                  <p className="text-xs text-[#6F7872]">Polígonos disponíveis para visualização no mapa</p>
                </div>
              </div>

              {carregandoLista ? (
                <Aviso texto="Carregando limites..." />
              ) : limites.length === 0 ? (
                <p className="rounded-xl bg-[#F4F5F0] p-4 text-sm text-[#6F7872]">
                  Nenhum limite cadastrado.
                </p>
              ) : (
                <div className="space-y-2">
                  {limites.map((limite) => (
                    <div
                      key={limite.id}
                      className="flex min-h-[72px] items-center gap-3 rounded-[16px] border border-[#DDE2DB] bg-white p-3 transition hover:border-[#8FAF72]"
                    >
                      <span
                        className="h-4 w-4 shrink-0 rounded-full ring-4 ring-[#F4F5F0]"
                        style={{ backgroundColor: limite.cor }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-[#17211C]">
                          {limite.nome}
                          {limite.numero ? ` · ${limite.numero}` : ""}
                        </p>
                        <p className="mt-0.5 text-xs text-[#6F7872]">
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
    <div className="rounded-[16px] border border-[#DDE2DB] bg-white p-4 text-sm text-[#6F7872]">
      {texto}
    </div>
  );
}

function Dado({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[#6F7872]">
        {label}
      </dt>
      <dd className="mt-1 break-words font-medium text-[#17211C]">{valor}</dd>
    </div>
  );
}
