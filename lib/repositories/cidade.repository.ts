import { createClient } from "@/lib/supabase/server";

export class CidadeRepository {

    static async buscar(
        id: number,
        congregacaoId: number
    ) {

        const supabase = await createClient();

        const { data, error } = await supabase
            .from("cidades")
            .select("*")
            .eq("id", id)
            .eq("congregacao_id", congregacaoId)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

}