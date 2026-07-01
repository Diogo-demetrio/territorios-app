import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: territorios, error } = await supabase
    .from("territorios")
    .select("*")
    .order("numero");

  console.log(error);
  console.log(territorios);

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-xl mx-auto">

        <h1 className="text-4xl font-bold mb-6">
          Territórios
        </h1>

        {error && (
          <pre className="bg-red-100 p-4 rounded mb-4">
            {JSON.stringify(error, null, 2)}
          </pre>
        )}

        <div className="space-y-4">
          {territorios?.map((territorio) => (
            <Link
              key={territorio.id}
              href={`/territorios/${territorio.id}`}
              className="block bg-white rounded-xl shadow p-4 hover:bg-slate-50 transition"
            >
              <h2 className="text-xl font-bold">
                {territorio.nome}
              </h2>

              <p className="text-gray-500">
                {territorio.bairro} • {territorio.cidade}
              </p>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}