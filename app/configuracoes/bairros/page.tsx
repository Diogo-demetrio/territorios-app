"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BairrosPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-4 pb-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center gap-3">
          <Link
            href="/configuracoes"
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
              Configurações
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Bairros
            </h1>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
          O cadastro de bairros está disponível dentro da página de cada cidade.
        </div>
      </div>
    </main>
  );
}