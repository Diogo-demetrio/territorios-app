import { createClient } from "@/lib/supabase/server";

export class TerritorioRepository {

    static async buscarPorId(
        id: number,
        congregacaoId: number
    ) {

        const supabase = await createClient();

        const { data, error } = await supabase
            .from("territorios")
            .select("*")
            .eq("id", id)
            .eq("congregacao_id", congregacaoId)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    static async listarPorCidade(
        cidadeId: number,
        congregacaoId: number
    ) {

        const supabase = await createClient();

        const { data, error } = await supabase
            .from("v_territorios_resumo")
            .select("*")
            .eq("cidade_id", cidadeId)
            .eq("congregacao_id", congregacaoId)
            .eq("ativo", true)
            .order("nome");

        if (error) {
            throw error;
        }

        return data;
    }
}