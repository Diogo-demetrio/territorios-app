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
  variant?: "default" | "green";
  activeItem?: "congregacoes" | "territorios" | "mapa" | "publicadores" | "configuracoes";
};

export default function MobileBottomNav({
  congregacaoId,
  variant = "default",
  activeItem,
}: Props) {
  const pathname = usePathname();

  const itens = [
    {
      id: "congregacoes" as const,
      href: "/",
      label: "Congregações",
      icon: Building2,
    },
    {
      id: "territorios" as const,
      href: `/congregacoes/${congregacaoId}/territorios`,
      label: "Territórios",
      icon: Map,
    },
    {
      id: "mapa" as const,
      href: `/congregacoes/${congregacaoId}/mapa`,
      label: "Mapa",
      icon: MapPinned,
    },
    {
      id: "publicadores" as const,
      href: `/congregacoes/${congregacaoId}/publicadores`,
      label: "Publicadores",
      icon: Users,
    },
   {
  id: "configuracoes" as const,
  href: "/configuracoes",
  label: "Config.",
  icon: Settings,
},
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 text-white shadow-[0_-6px_24px_rgba(11,43,32,0.14)] ${
        variant === "green"
          ? "border-t border-white/10 bg-[#123D2C]"
          : "border-t bg-violet-700"
      }`}
    >
      <div className="mx-auto flex max-w-[820px] justify-around px-2 py-2.5 sm:py-3">
        {itens.map((item) => {
          const Icon = item.icon;

          const painelDaCongregacao =
            variant === "green" &&
            item.href === "/" &&
            pathname === `/congregacoes/${congregacaoId}`;

          const ativo =
            activeItem
              ? item.id === activeItem
              : painelDaCongregacao ||
                pathname === item.href ||
                pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition sm:flex-none sm:px-4 ${
                ativo
                  ? variant === "green"
                    ? "text-white opacity-100"
                    : "bg-white/15 opacity-100"
                  : "text-white opacity-65 hover:opacity-100"
              }`}
            >
              <div
                className={`flex h-8 w-12 items-center justify-center rounded-xl transition ${
                  ativo && variant === "green"
                    ? "bg-white/12 text-[#DCE8D5]"
                    : ""
                }`}
              >
                <Icon size={21} />
              </div>

              <span className="truncate text-[10px] font-medium sm:text-[11px]">
                {item.label}
              </span>

              {ativo && variant === "green" && (
                <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-[#8FAF72]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
