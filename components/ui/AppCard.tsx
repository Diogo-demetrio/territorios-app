type Props = {
  children: React.ReactNode;
  className?: string;
};

export function AppCard({ children, className = "" }: Props) {
  return (
    <div className={`rounded-2xl bg-white p-4 shadow-sm border border-slate-100 ${className}`}>
      {children}
    </div>
  );
}