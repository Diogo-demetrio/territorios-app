-- A camada de limites é uma ferramenta de trabalho interna.
-- Usuários anônimos continuam acessando o mapa, mas não recebem os polígonos.

revoke select on public.limites_congregacoes from anon;
grant select on public.limites_congregacoes to authenticated;

drop policy if exists "Limites ativos podem ser visualizados"
on public.limites_congregacoes;

create policy "Limites ativos podem ser visualizados"
on public.limites_congregacoes
for select
to authenticated
using (ativo = true);
