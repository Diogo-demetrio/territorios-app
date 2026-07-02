import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  backHref?: string;
};

export function AppHeader({ title, subtitle, backHref }: Props) {
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 bg-[#673AB7] px-4 py-4 text-white shadow">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        {backHref && (
          <Link href={backHref} className="text-xl font-bold">
            ←
          </Link>
        )}

        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-white/80">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}