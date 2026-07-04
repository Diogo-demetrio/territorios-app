import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CongregacaoDashboard from "@/components/cards/CongregacaoDashboard";

export default async function CongregacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const congregacaoId = Number(id);

  const { data: congregacao } = await supabase
    .from("congregacoes")
    .select("*")
    .eq("id", congregacaoId)
    .single();

  const { count: totalTerritorios } = await supabase
    .from("territorios")
    .select("*", { count: "exact", head: true })
    .eq("congregacao_id", congregacaoId);

  const { data: territorios } = await supabase
    .from("territorios")
    .select("id")
    .eq("congregacao_id", congregacaoId);

  const idsTerritorios = territorios?.map((t) => t.id) ?? [];

  let totalEnderecos = 0;

  if (idsTerritorios.length > 0) {
    const { count } = await supabase
      .from("enderecos")
      .select("*", { count: "exact", head: true })
      .in("territorio_id", idsTerritorios);

    totalEnderecos = count ?? 0;
  }

  const { count: totalPublicadores } = await supabase
    .from("publicadores")
    .select("*", { count: "exact", head: true })
    .eq("congregacao_id", congregacaoId);

  const { count: totalGrupos } = await supabase
    .from("grupos")
    .select("*", { count: "exact", head: true })
    .eq("congregacao_id", congregacaoId);

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 bg-violet-700 px-6 py-5 text-white shadow">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link href="/" className="text-xl font-bold">
            ←
          </Link>

          <h1 className="text-xl font-semibold">
            {congregacao?.nome}
          </h1>
        </div>
      </header>

      <section className="mx-auto max-w-3xl p-6">
        <CongregacaoDashboard
          congregacaoId={congregacaoId}
          nome={congregacao?.nome ?? ""}
          cidade={`${congregacao?.cidade_base ?? ""} · ${congregacao?.idioma ?? ""}`}
          territorios={totalTerritorios ?? 0}
          enderecos={totalEnderecos}
          publicadores={totalPublicadores ?? 0}
          grupos={totalGrupos ?? 0}
        />
      </section>
    </main>
  );
}