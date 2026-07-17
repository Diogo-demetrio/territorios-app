import { createClient } from "@/lib/supabase/client";

/**
 * Cliente Supabase usado nos componentes do navegador.
 *
 * Este export foi mantido temporariamente para não quebrar os
 * componentes existentes durante a refatoração.
 */
export const supabase = createClient();