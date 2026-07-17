import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL não está configurada."
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY não está configurada."
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(name, value, options);
              }
            );
          } catch {
            /*
             * Em Server Components, a escrita de cookies pode não ser
             * permitida. A atualização da sessão será tratada depois
             * pelo proxy de autenticação.
             */
          }
        },
      },
    }
  );
}