-- Mantém a data da última visita e altera somente o status após 30 dias.
-- O job executa diariamente às 06:00 UTC (03:00 em America/Sao_Paulo).

create extension if not exists pg_cron;

create or replace function public.expirar_visitas_apos_30_dias()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  total_atualizado integer;
begin
  update public.enderecos
  set status = 'nao_visitado'
  where ativo = true
    and status = 'visitado'
    and ultima_visita is not null
    and ultima_visita <= current_date - 30;

  get diagnostics total_atualizado = row_count;
  return total_atualizado;
end;
$$;

revoke all on function public.expirar_visitas_apos_30_dias() from public;
revoke all on function public.expirar_visitas_apos_30_dias() from anon;
revoke all on function public.expirar_visitas_apos_30_dias() from authenticated;

select cron.schedule(
  'expirar-visitas-apos-30-dias',
  '0 6 * * *',
  $$select public.expirar_visitas_apos_30_dias();$$
);

-- Corrige imediatamente os registros que já ultrapassaram 30 dias.
select public.expirar_visitas_apos_30_dias();
