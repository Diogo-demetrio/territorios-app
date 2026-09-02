import { supabase } from "@/lib/supabase";

export async function buscarUnidadePublica(slug: string) {
  const { data, error } = await supabase
    .from("congregacoes")
    .select(`
      id,
      nome,
      cidade_base,
      idioma,
      tipo_unidade,
      slug_publico,
      status_cadastro,
      ativa
    `)
    .eq("slug_publico", slug)
    .eq("status_cadastro", "aprovada")
    .eq("ativa", true)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
