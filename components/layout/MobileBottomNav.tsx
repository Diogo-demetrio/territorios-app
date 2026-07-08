"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Map,
  MapPinned,
  Users,
  Settings,
} from "lucide-react";

type Props = {
  congregacaoId: string;
};

export default function MobileBottomNav({ congregacaoId }: Props) {
  const pathname = usePathname();

  const itens = [
    {
      href: "/",
      label: "Congregações",
      icon: Building2,
    },
    {
      href: `/congregacoes/${congregacaoId}/territorios`,
      label: "Territórios",
      icon: Map,
    },
    {
      href: `/congregacoes/${congregacaoId}/mapa`,
      label: "Mapa",
      icon: MapPinned,
    },
    {
      href: `/congregacoes/${congregacaoId}/publicadores`,
      label: "Publicadores",
      icon: Users,
    },
   {
  href: "/configuracoes",
  label: "Config.",
  icon: Settings,
},
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-violet-700 text-white shadow-lg">
      <div className="mx-auto flex max-w-3xl justify-around py-3">
        {itens.map((item) => {
          const Icon = item.icon;

          const ativo =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
             className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition ${
    ativo
      ? "bg-white/15 opacity-100"
      : "opacity-70 hover:opacity-100"
  }`}
>
              <div className="flex h-8 w-12 items-center justify-center rounded-xl">
  <Icon size={21} />
</div>

              <span className="text-[11px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}