import { AppHeader } from "./AppHeader";
import { BottomNavigation } from "./BottomNavigation";

type Props = {
  title: string;
  subtitle?: string;
  backHref?: string;
  congregacaoId?: string;
  children: React.ReactNode;
};

export function AppShell({
  title,
  subtitle,
  backHref,
  congregacaoId,
  children,
}: Props) {
  return (
    <main className="min-h-screen bg-[#F5F5F7] px-4 pb-24">
      <AppHeader title={title} subtitle={subtitle} backHref={backHref} />

      <div className="mx-auto max-w-xl">{children}</div>

      {congregacaoId && <BottomNavigation congregacaoId={congregacaoId} />}
    </main>
  );
}