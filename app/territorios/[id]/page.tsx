import { supabase } from "@/lib/supabase";
import NovoEnderecoForm from "@/components/enderecos/NovoEnderecoForm";
import ListaEnderecosSelecionavel from "@/components/enderecos/ListaEnderecosSelecionavel";
import { AppShell } from "@/components/layout/AppShell";

export default async function Territorio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: territorio } = await supabase
    .from("territorios")
    .select("*")
    .eq("id", id)
    .single();

  const { data: congregacao } = await supabase
    .from("congregacoes")
    .select("*")
    .eq("id", territorio?.congregacao_id)
    .single();

  const { data: enderecos } = await supabase
    .from("enderecos")
    .select("*")
    .eq("territorio_id", id)
    .order("id");

  return (
    <AppShell
      title={territorio?.nome ?? "Território"}
      subtitle={`${territorio?.bairro ?? ""} • ${territorio?.cidade ?? ""} • ${
        enderecos?.length ?? 0
      } endereços`}
      backHref={`/congregacoes/${territorio?.congregacao_id}/territorios`}
      congregacaoId={String(territorio?.congregacao_id)}
    >
      <NovoEnderecoForm
        territorioId={territorio.id}
        cidade={territorio.cidade}
        bairro={territorio.bairro}
      />

      <ListaEnderecosSelecionavel
        enderecos={enderecos ?? []}
        territorio={territorio}
        congregacao={congregacao}
      />
    </AppShell>
  );
}